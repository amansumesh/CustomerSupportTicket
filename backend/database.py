import os
import uuid
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "customer_support_db")
COLLECTION_NAME = "tickets"

class DatabaseManager:
    def __init__(self):
        self.uri = MONGODB_URI
        self.db_name = DATABASE_NAME
        self.client: Optional[MongoClient] = None
        self.db = None
        self.collection = None
        self.is_connected = False
        self.last_check_time = 0.0
        self._init_mongo()

    def _init_mongo(self):
        self.last_check_time = time.time()
        try:
            if not self.uri:
                print("[Database] Warning: MONGODB_URI is empty. Please configure backend/.env.")
                self.is_connected = False
                return

            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            # Confirm connection to MongoDB Atlas
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.collection = self.db[COLLECTION_NAME]

            # Ensure indexes for rapid search, deduplication & sort
            self.collection.create_index("ticket_id", unique=True)
            self.collection.create_index([("created_at", DESCENDING)])
            self.collection.create_index("queue")
            self.collection.create_index("priority")
            self.collection.create_index("status")

            self.is_connected = True
            print(f"[Database] Successfully connected to MongoDB Atlas at {self._sanitized_uri()} (Database: {self.db_name})")
        except Exception as e:
            self.is_connected = False
            self.collection = None
            print(f"[Database] MongoDB Atlas connection failed: {e}")

    def check_connection(self) -> bool:
        now = time.time()
        if not self.is_connected:
            if now - self.last_check_time > 10:
                self._init_mongo()
        else:
            if now - self.last_check_time > 30:
                self.last_check_time = now
                try:
                    self.client.admin.command('ping')
                    self.is_connected = True
                except Exception:
                    self.is_connected = False
        return self.is_connected

    def _sanitized_uri(self) -> str:
        if not self.uri:
            return "None"
        if "@" in self.uri:
            prefix = self.uri.split("@")[0].split("//")[0] + "//"
            rest = self.uri.split("@")[1]
            return f"{prefix}***:***@{rest}"
        return self.uri

    def get_status(self) -> Dict[str, Any]:
        connected = self.check_connection()
        total = 0
        if connected and self.collection is not None:
            try:
                total = self.collection.count_documents({})
            except Exception:
                total = 0
        return {
            "mongodb_connected": connected,
            "uri": self._sanitized_uri(),
            "database": self.db_name,
            "collection": COLLECTION_NAME,
            "total_tickets": total,
            "storage_mode": "MongoDB Atlas"
        }

    def insert_ticket(self, ticket: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        if "created_at" not in ticket or not ticket["created_at"]:
            ticket["created_at"] = now
        ticket["updated_at"] = now

        if "ticket_id" not in ticket or not ticket["ticket_id"]:
            ticket["ticket_id"] = f"TCK-{str(uuid.uuid4())[:8].upper()}"

        if "_id" not in ticket:
            ticket["_id"] = str(uuid.uuid4())

        if self.check_connection() and self.collection is not None:
            doc = ticket.copy()
            self.collection.insert_one(doc)
            return self._format_doc(doc)
        else:
            raise RuntimeError("MongoDB Atlas is not connected. Unable to save ticket.")

    def get_tickets(
        self,
        search: Optional[str] = None,
        queue: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        if not self.check_connection() or self.collection is None:
            return {
                "tickets": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "total_pages": 1,
                "source": "mongodb_atlas"
            }

        query: Dict[str, Any] = {}
        if queue and queue != "all":
            query["queue"] = queue
        if priority and priority != "all":
            query["priority"] = priority.lower()
        if status and status != "all":
            query["status"] = status
        if search:
            query["$or"] = [
                {"subject": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"customer_name": {"$regex": search, "$options": "i"}},
                {"customer_email": {"$regex": search, "$options": "i"}},
                {"ticket_id": {"$regex": search, "$options": "i"}},
            ]

        total = self.collection.count_documents(query)
        cursor = self.collection.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
        items = [self._format_doc(doc) for doc in cursor]

        return {
            "tickets": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": max(1, (total + limit - 1) // limit),
            "source": "mongodb_atlas"
        }

    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        if not self.check_connection() or self.collection is None:
            return None

        doc = self.collection.find_one({"$or": [{"ticket_id": ticket_id}, {"_id": ticket_id}]})
        if doc:
            return self._format_doc(doc)
        return None

    def update_ticket(self, ticket_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.check_connection() or self.collection is None:
            return None

        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        try:
            res = self.collection.find_one_and_update(
                {"$or": [{"ticket_id": ticket_id}, {"_id": ticket_id}]},
                {"$set": updates},
                return_document=True
            )
            if res:
                return self._format_doc(res)
        except Exception as e:
            print(f"[Database] MongoDB Atlas update error: {e}")
        return None

    def delete_ticket(self, ticket_id: str) -> bool:
        if not self.check_connection() or self.collection is None:
            return False

        try:
            res = self.collection.delete_one({"$or": [{"ticket_id": ticket_id}, {"_id": ticket_id}]})
            return res.deleted_count > 0
        except Exception as e:
            print(f"[Database] MongoDB Atlas delete error: {e}")
            return False

    def get_analytics(self) -> Dict[str, Any]:
        if not self.check_connection() or self.collection is None:
            return {
                "total_tickets": 0,
                "status_breakdown": {"Open": 0, "In Progress": 0, "Resolved": 0, "Closed": 0},
                "priority_breakdown": {"high": 0, "medium": 0, "low": 0},
                "queue_breakdown": {},
                "average_confidence": 0.0,
                "database_status": self.get_status()
            }

        tickets = list(self.collection.find({}))
        total = len(tickets)
        status_counts = {"Open": 0, "In Progress": 0, "Resolved": 0, "Closed": 0}
        priority_counts = {"high": 0, "medium": 0, "low": 0}
        queue_counts: Dict[str, int] = {}
        confidences = []

        for t in tickets:
            st = t.get("status", "Open")
            status_counts[st] = status_counts.get(st, 0) + 1

            pr = str(t.get("priority", "medium")).lower()
            priority_counts[pr] = priority_counts.get(pr, 0) + 1

            q = t.get("queue", "General Inquiry")
            queue_counts[q] = queue_counts.get(q, 0) + 1

            if "queue_confidence" in t and isinstance(t["queue_confidence"], (int, float)):
                confidences.append(float(t["queue_confidence"]))

        avg_confidence = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

        return {
            "total_tickets": total,
            "status_breakdown": status_counts,
            "priority_breakdown": priority_counts,
            "queue_breakdown": queue_counts,
            "average_confidence": avg_confidence,
            "database_status": self.get_status()
        }

    def _format_doc(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        d = doc.copy()
        _id = d.pop("_id", None)
        d["id"] = str(_id) if _id else d.get("id", str(uuid.uuid4()))
        return d

db_manager = DatabaseManager()
