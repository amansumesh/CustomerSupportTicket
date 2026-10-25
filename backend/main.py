import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from schemas import (
    ClassificationRequest,
    ClassificationResult,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketNoteAdd,
    BatchClassifyRequest,
    BatchImportRequest,
)
from classifier import classifier_service
from database import db_manager
from seed_data import SAMPLE_TICKETS

app = FastAPI(
    title="Customer Support Ticket AI Classification API",
    description="Intelligent Ticket Triage & Queue Routing powered by Scikit-Learn LinearSVC models and MongoDB persistence",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (default port 3000) and all dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # If storage is empty, auto-seed sample realistic tickets
    analytics = db_manager.get_analytics()
    if analytics.get("total_tickets", 0) == 0:
        print("[Startup] Seeding initial realistic tickets...")
        for item in SAMPLE_TICKETS:
            classification = classifier_service.classify_text(item["subject"], item["description"])
            ticket_doc = {
                **item,
                "predicted_queue": classification["queue"],
                "queue": item.get("override_queue") or classification["queue"],
                "queue_confidence": classification["queue_confidence"],
                "top_queues": classification["top_queues"],
                "all_queue_scores": classification["all_queue_scores"],
                "predicted_priority": classification["priority"],
                "priority": item.get("override_priority") or classification["priority"],
                "priority_confidence": classification["priority_confidence"],
                "priority_distribution": classification["priority_distribution"],
                "notes": [
                    {
                        "author": "AI Triage Engine",
                        "message": f"Classified automatically: Queue '{classification['queue']}' ({round(classification['queue_confidence'] * 100, 1)}%) | Priority '{classification['priority'].upper()}' ({round(classification['priority_confidence'] * 100, 1)}%)",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                ]
            }
            db_manager.insert_ticket(ticket_doc)

@app.get("/api/health")
def health_check():
    db_status = db_manager.get_status()
    model_status = classifier_service.get_info()
    return {
        "status": "healthy",
        "service": "Support Ticket AI Backend",
        "database": db_status,
        "models": {
            "loaded": model_status["loaded"],
            "priority_classes": model_status["priority_classes"],
            "queue_classes": model_status["queue_classes"]
        }
    }

@app.post("/api/classify", response_model=ClassificationResult)
def classify_ticket_preview(payload: ClassificationRequest):
    """Real-time ticket classification preview without persisting to MongoDB"""
    res = classifier_service.classify_text(payload.subject, payload.description)
    return res

@app.post("/api/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate):
    """Classify ticket with scikit-learn models and store in MongoDB"""
    ai_res = classifier_service.classify_text(payload.subject, payload.description)

    final_queue = payload.override_queue if payload.override_queue else ai_res["queue"]
    final_priority = payload.override_priority if payload.override_priority else ai_res["priority"]

    ticket_doc = {
        "subject": payload.subject,
        "description": payload.description,
        "customer_name": payload.customer_name or "Valued Customer",
        "customer_email": payload.customer_email or "customer@example.com",
        "channel": payload.channel or "Web Portal",
        "tags": payload.tags or [],
        "predicted_queue": ai_res["queue"],
        "queue": final_queue,
        "queue_confidence": ai_res["queue_confidence"],
        "top_queues": ai_res["top_queues"],
        "all_queue_scores": ai_res["all_queue_scores"],
        "predicted_priority": ai_res["priority"],
        "priority": final_priority,
        "priority_confidence": ai_res["priority_confidence"],
        "priority_distribution": ai_res["priority_distribution"],
        "status": "Open",
        "assigned_agent": "Unassigned",
        "notes": [
            {
                "author": "AI Auto-Triage",
                "message": f"Assigned to {final_queue} ({round(ai_res['queue_confidence'] * 100, 1)}% confidence) with {final_priority.upper()} priority ({round(ai_res['priority_confidence'] * 100, 1)}% confidence).",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
    }

    if payload.override_queue or payload.override_priority:
        ticket_doc["notes"].append({
            "author": "System",
            "message": f"Manual triage override applied: Queue={final_queue}, Priority={final_priority}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    saved = db_manager.insert_ticket(ticket_doc)
    return saved

@app.get("/api/tickets")
def list_tickets(
    search: Optional[str] = Query(None, description="Search keyword in subject, description, or customer info"),
    queue: Optional[str] = Query("all", description="Filter by Queue name"),
    priority: Optional[str] = Query("all", description="Filter by priority (high, medium, low)"),
    status: Optional[str] = Query("all", description="Filter by ticket status"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve tickets from MongoDB with filters and pagination"""
    return db_manager.get_tickets(
        search=search,
        queue=queue,
        priority=priority,
        status=status,
        page=page,
        limit=limit
    )

@app.get("/api/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket_details(ticket_id: str):
    """Fetch single ticket by ticket_id or MongoDB _id"""
    ticket = db_manager.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.patch("/api/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket_details(ticket_id: str, updates: TicketUpdate):
    """Update ticket status, routing, assigned agent, or append agent notes"""
    existing = db_manager.get_ticket(ticket_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_dict = {}
    if updates.status is not None:
        update_dict["status"] = updates.status
    if updates.queue is not None:
        update_dict["queue"] = updates.queue
    if updates.priority is not None:
        update_dict["priority"] = updates.priority.lower()
    if updates.assigned_agent is not None:
        update_dict["assigned_agent"] = updates.assigned_agent

    if updates.add_note:
        notes = existing.get("notes", [])
        notes.append({
            "author": "Agent",
            "message": updates.add_note,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        update_dict["notes"] = notes

    updated = db_manager.update_ticket(ticket_id, update_dict)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update ticket")
    return updated

@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(ticket_id: str):
    """Remove ticket from MongoDB"""
    success = db_manager.delete_ticket(ticket_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found or could not be deleted")
    return {"message": "Ticket deleted successfully", "ticket_id": ticket_id}

@app.post("/api/tickets/batch")
def batch_classify_and_import(payload: BatchImportRequest):
    """Batch process multiple customer inquiries and persist them"""
    results = []
    for item in payload.tickets:
        ai_res = classifier_service.classify_text(item.subject, item.description)
        final_queue = item.override_queue if item.override_queue else ai_res["queue"]
        final_priority = item.override_priority if item.override_priority else ai_res["priority"]

        ticket_doc = {
            "subject": item.subject,
            "description": item.description,
            "customer_name": item.customer_name or "Valued Customer",
            "customer_email": item.customer_email or "customer@example.com",
            "channel": item.channel or "Bulk Upload",
            "tags": item.tags or ["batch-import"],
            "predicted_queue": ai_res["queue"],
            "queue": final_queue,
            "queue_confidence": ai_res["queue_confidence"],
            "top_queues": ai_res["top_queues"],
            "all_queue_scores": ai_res["all_queue_scores"],
            "predicted_priority": ai_res["priority"],
            "priority": final_priority,
            "priority_confidence": ai_res["priority_confidence"],
            "priority_distribution": ai_res["priority_distribution"],
            "status": "Open",
            "assigned_agent": "Unassigned",
            "notes": [
                {
                    "author": "AI Batch Processor",
                    "message": f"Auto-classified during batch import: {final_queue} ({round(ai_res['queue_confidence'] * 100, 1)}%)",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ]
        }
        saved = db_manager.insert_ticket(ticket_doc)
        results.append(saved)
    return {"imported_count": len(results), "tickets": results}

@app.get("/api/analytics")
def get_dashboard_analytics():
    """Aggregated stats and metrics for the frontend overview dashboard"""
    return db_manager.get_analytics()

@app.get("/api/models/info")
def get_model_metadata():
    """Information on the loaded classification models and evaluation metrics"""
    return classifier_service.get_info()

@app.post("/api/tickets/seed")
def seed_tickets_endpoint():
    """Force seed realistic demonstration tickets"""
    count = 0
    for item in SAMPLE_TICKETS:
        classification = classifier_service.classify_text(item["subject"], item["description"])
        ticket_doc = {
            **item,
            "predicted_queue": classification["queue"],
            "queue": item.get("override_queue") or classification["queue"],
            "queue_confidence": classification["queue_confidence"],
            "top_queues": classification["top_queues"],
            "all_queue_scores": classification["all_queue_scores"],
            "predicted_priority": classification["priority"],
            "priority": item.get("override_priority") or classification["priority"],
            "priority_confidence": classification["priority_confidence"],
            "priority_distribution": classification["priority_distribution"],
            "notes": [
                {
                    "author": "AI Auto-Triage",
                    "message": f"Classified automatically: {classification['queue']} ({round(classification['queue_confidence'] * 100, 1)}%)",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ]
        }
        db_manager.insert_ticket(ticket_doc)
        count += 1
    return {"message": f"Successfully seeded {count} demo support tickets into database"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
