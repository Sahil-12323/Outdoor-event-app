from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import logging
from pathlib import Path
import json
import asyncio
from collections import defaultdict
import aiohttp
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="TrailMeet API", description="API for outdoor events and adventures")
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    picture: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session_token: Optional[str] = None
    session_expires: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    picture: str = ""

class EventLocation(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    address: str

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    location: EventLocation
    event_date: datetime
    event_type: str = Field(..., regex="^(hiking|camping|cycling|sports|workshop|festival|climbing|kayaking|running)$")
    capacity: Optional[int] = Field(None, gt=0, le=1000)
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    participants: List[str] = Field(default_factory=list)
    status: str = Field(default="active", regex="^(active|cancelled|completed)$")

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    location: EventLocation
    event_date: datetime
    event_type: str = Field(..., regex="^(hiking|camping|cycling|sports|workshop|festival|climbing|kayaking|running)$")
    capacity: Optional[int] = Field(None, gt=0, le=1000)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    user_name: str
    message: str = Field(..., min_length=1, max_length=1000)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

# Helper functions
def prepare_for_mongo(data: dict) -> dict:
    """Prepare data for MongoDB storage"""
    if isinstance(data.get('event_date'), datetime):
        data['event_date'] = data['event_date'].isoformat()
    if isinstance(data.get('created_at'), datetime):
        data['created_at'] = data['created_at'].isoformat()
    if isinstance(data.get('timestamp'), datetime):
        data['timestamp'] = data['timestamp'].isoformat()
    if isinstance(data.get('session_expires'), datetime):
        data['session_expires'] = data['session_expires'].isoformat()
    return data

def parse_from_mongo(item: dict) -> dict:
    """Parse data from MongoDB storage"""
    if isinstance(item.get('event_date'), str):
        try:
            item['event_date'] = datetime.fromisoformat(item['event_date'].replace('Z', '+00:00'))
        except:
            pass
    if isinstance(item.get('created_at'), str):
        try:
            item['created_at'] = datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
        except:
            pass
    if isinstance(item.get('timestamp'), str):
        try:
            item['timestamp'] = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
        except:
            pass
    if isinstance(item.get('session_expires'), str):
        try:
            item['session_expires'] = datetime.fromisoformat(item['session_expires'].replace('Z', '+00:00'))
        except:
            pass
    return item

# Authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = credentials.credentials
    user_doc = await db.users.find_one({"session_token": token})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    user_doc = parse_from_mongo(user_doc)
    
    # Check if session is expired
    if user_doc.get('session_expires') and user_doc['session_expires'] < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    return User(**user_doc)

# Routes
@api_router.get("/")
async def root():
    return {"message": "TrailMeet API is running", "status": "healthy"}

@api_router.post("/auth/session", response_model=User)
async def create_session_from_emergent_auth():
    """Handle session creation from Emergent authentication"""
    # This would normally process the session_id from Emergent auth
    # For now, create a demo user
    demo_user_data = {
        "id": str(uuid.uuid4()),
        "email": "demo@example.com",
        "name": "Demo User",
        "picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "session_token": str(uuid.uuid4()),
        "session_expires": datetime.now(timezone.utc).replace(hour=23, minute=59, second=59),
        "created_at": datetime.now(timezone.utc)
    }
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": demo_user_data["email"]})
    if existing_user:
        # Update session
        await db.users.update_one(
            {"email": demo_user_data["email"]},
            {"$set": {
                "session_token": demo_user_data["session_token"],
                "session_expires": demo_user_data["session_expires"].isoformat()
            }}
        )
        existing_user = parse_from_mongo(existing_user)
        existing_user.update({
            "session_token": demo_user_data["session_token"],
            "session_expires": demo_user_data["session_expires"]
        })
        return User(**existing_user)
    else:
        # Create new user
        user_for_mongo = prepare_for_mongo(demo_user_data.copy())
        await db.users.insert_one(user_for_mongo)
        return User(**demo_user_data)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@api_router.post("/auth/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout current user"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$unset": {"session_token": "", "session_expires": ""}}
    )
    return {"message": "Logged out successfully"}

@api_router.get("/events", response_model=List[Event])
async def get_events():
    """Get all active events"""
    events = await db.events.find({"status": "active"}).to_list(length=100)
    return [Event(**parse_from_mongo(event)) for event in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    """Get a specific event by ID"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**parse_from_mongo(event))

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    """Create a new event"""
    event_dict = event_data.dict()
    event_dict.update({
        "id": str(uuid.uuid4()),
        "created_by": current_user.id,
        "created_at": datetime.now(timezone.utc),
        "participants": [],
        "status": "active"
    })
    
    event = Event(**event_dict)
    event_for_mongo = prepare_for_mongo(event.dict())
    
    await db.events.insert_one(event_for_mongo)
    return event

@api_router.post("/events/{event_id}/join")
async def join_event(event_id: str, current_user: User = Depends(get_current_user)):
    """Join an event"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event = parse_from_mongo(event)
    
    if current_user.id in event.get('participants', []):
        raise HTTPException(status_code=400, detail="Already joined this event")
    
    if event.get('capacity') and len(event.get('participants', [])) >= event['capacity']:
        raise HTTPException(status_code=400, detail="Event is full")
    
    await db.events.update_one(
        {"id": event_id},
        {"$push": {"participants": current_user.id}}
    )
    
    return {"message": "Successfully joined the event"}

@api_router.delete("/events/{event_id}/leave")
async def leave_event(event_id: str, current_user: User = Depends(get_current_user)):
    """Leave an event"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    await db.events.update_one(
        {"id": event_id},
        {"$pull": {"participants": current_user.id}}
    )
    
    return {"message": "Successfully left the event"}

@api_router.get("/events/{event_id}/chat", response_model=List[ChatMessage])
async def get_event_chat(event_id: str, current_user: User = Depends(get_current_user)):
    """Get chat messages for an event"""
    # Verify user has access to this event chat
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    messages = await db.chat_messages.find({"event_id": event_id}).sort("timestamp", 1).to_list(length=100)
    return [ChatMessage(**parse_from_mongo(msg)) for msg in messages]

@api_router.post("/events/{event_id}/chat", response_model=ChatMessage)
async def send_chat_message(
    event_id: str, 
    message_data: ChatMessageCreate, 
    current_user: User = Depends(get_current_user)
):
    """Send a chat message to an event"""
    # Verify event exists
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    message_dict = {
        "id": str(uuid.uuid4()),
        "event_id": event_id,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "message": message_data.message,
        "timestamp": datetime.now(timezone.utc)
    }
    
    chat_message = ChatMessage(**message_dict)
    message_for_mongo = prepare_for_mongo(chat_message.dict())
    
    await db.chat_messages.insert_one(message_for_mongo)
    return chat_message

@api_router.get("/my-events", response_model=List[Event])
async def get_my_events(current_user: User = Depends(get_current_user)):
    """Get events created by or joined by current user"""
    created_events = await db.events.find({"created_by": current_user.id}).to_list(length=50)
    joined_events = await db.events.find({"participants": current_user.id}).to_list(length=50)
    
    all_events = {event['id']: event for event in created_events + joined_events}
    return [Event(**parse_from_mongo(event)) for event in all_events.values()]

# Include router
app.include_router(api_router)

# Create indexes on startup
@app.on_event("startup")
async def create_indexes():
    """Create database indexes for better performance"""
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("session_token")
        await db.events.create_index("status")
        await db.events.create_index("event_type")
        await db.events.create_index("created_by")
        await db.chat_messages.create_index([("event_id", 1), ("timestamp", 1)])
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)