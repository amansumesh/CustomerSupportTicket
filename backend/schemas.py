from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ClassificationRequest(BaseModel):
    subject: str = Field(..., description="Subject or title of the ticket")
    description: str = Field(..., description="Full body or customer inquiry message")

class ClassificationResult(BaseModel):
    queue: str
    queue_confidence: float
    top_queues: List[Dict[str, Any]]
    all_queue_scores: Dict[str, float]
    priority: str
    priority_confidence: float
    priority_distribution: Dict[str, float]
    processed_text: str

class TicketCreate(BaseModel):
    subject: str
    description: str
    customer_name: Optional[str] = "Valued Customer"
    customer_email: Optional[str] = "support-client@example.com"
    channel: Optional[str] = "Web Portal" # Web Portal, Email, Mobile App, Live Chat
    tags: Optional[List[str]] = []
    override_queue: Optional[str] = None
    override_priority: Optional[str] = None

class TicketNoteAdd(BaseModel):
    author: Optional[str] = "Agent"
    message: str

class TicketUpdate(BaseModel):
    status: Optional[str] = None # Open, In Progress, Pending Customer, Resolved, Closed
    queue: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent: Optional[str] = None
    add_note: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    ticket_id: str
    subject: str
    description: str
    customer_name: str
    customer_email: str
    channel: str
    tags: List[str]
    predicted_queue: str
    queue: str
    queue_confidence: float
    top_queues: List[Dict[str, Any]]
    all_queue_scores: Dict[str, float]
    predicted_priority: str
    priority: str
    priority_confidence: float
    priority_distribution: Dict[str, float]
    status: str
    assigned_agent: Optional[str] = "Unassigned"
    notes: List[Dict[str, Any]] = []
    created_at: str
    updated_at: str

class BatchClassifyRequest(BaseModel):
    tickets: List[ClassificationRequest]

class BatchImportRequest(BaseModel):
    tickets: List[TicketCreate]
