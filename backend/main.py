from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List
import os
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr, validator
import uvicorn
import secrets
import hashlib
import time
from functools import wraps

# Load environment variables
load_dotenv()

app = FastAPI(title="ZownLead CRM API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30

print(f"MongoDB Connection String: {MONGODB_CONNECTION_STRING}")
print(f"JWT Secret: {JWT_SECRET[:10]}...")

if not MONGODB_CONNECTION_STRING:
    print("WARNING: MONGODB_CONNECTION_STRING environment variable is not set!")
    print("Please set it in your .env file")
    # For development, we'll use a default connection string
    MONGODB_CONNECTION_STRING = "mongodb://localhost:27017/zownlead_crm"
    print(f"Using default connection string: {MONGODB_CONNECTION_STRING}")

try:
    client = AsyncIOMotorClient(MONGODB_CONNECTION_STRING)
    db = client.crm_database
    print("MongoDB client created successfully")
except Exception as e:
    print(f"Error creating MongoDB client: {e}")
    raise

# Collections
users_collection = db.users
leads_collection = db.leads
brands_collection = db.brands
products_collection = db.products
locations_collection = db.locations
statuses_collection = db.statuses
sources_collection = db.sources
ownership_collection = db.ownership
login_attempts_collection = db.login_attempts
targets_collection = db.targets
# New collections for Calendar and Tasks
calendar_events_collection = db.calendar_events
tasks_collection = db.tasks

# Enhanced Pydantic models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(..., pattern="^(admin|sales)$")
    phone_number: Optional[str] = Field(None, max_length=20)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str = "active"
    last_login: Optional[str] = None
    phone_number: Optional[str] = None
    created_at: Optional[str] = None

class TargetCreate(BaseModel):
    user_id: str = Field(alias="userId")
    sales_target: float = Field(alias="salesTarget", ge=0)
    invoice_target: float = Field(alias="invoiceTarget", ge=0)
    period: str = Field(default="monthly", pattern="^(monthly|quarterly|yearly)$")
    
    class Config:
        populate_by_name = True

class TargetUpdate(BaseModel):
    sales_target: Optional[float] = Field(None, alias="salesTarget", ge=0)
    invoice_target: Optional[float] = Field(None, alias="invoiceTarget", ge=0)
    period: Optional[str] = Field(None, pattern="^(monthly|quarterly|yearly)$")
    
    class Config:
        populate_by_name = True

class TargetResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    sales_target: float = Field(alias="salesTarget")
    invoice_target: float = Field(alias="invoiceTarget")
    sales_achieved: float = Field(alias="salesAchieved")
    invoice_achieved: float = Field(alias="invoiceAchieved")
    period: str
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    
    class Config:
        populate_by_name = True

class LeadCreate(BaseModel):
    first_name: str = Field(alias="firstName", min_length=1, max_length=100)
    last_name: str = Field(alias="lastName", max_length=100, default="")
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    domain: str = Field(..., min_length=1, max_length=255)
    price: float = Field(default=0, ge=0)
    clicks: int = Field(default=0, ge=0)
    status: str = Field(default="new", pattern="^(new|contacted|qualified|converted|lost)$")
    source: str = Field(default="website", pattern="^(website|referral|call|other)$")
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    notes: Optional[str] = Field(None, max_length=1000)

    class Config:
        populate_by_name = True

class LeadUpdate(BaseModel):
    first_name: Optional[str] = Field(None, alias="firstName", min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, alias="lastName", max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    domain: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[float] = Field(None, ge=0)
    clicks: Optional[int] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(new|contacted|qualified|converted|lost)$")
    source: Optional[str] = Field(None, pattern="^(website|referral|call|other)$")
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    notes: Optional[str] = Field(None, max_length=1000)

    class Config:
        populate_by_name = True

class LeadResponse(BaseModel):
    id: str
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    email: str
    phone: Optional[str] = None
    domain: str
    price: float
    clicks: int
    update: str
    status: str
    source: str
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    notes: Optional[str] = None
    created_at: str = Field(alias="createdAt")

    class Config:
        populate_by_name = True

# Calendar Event Models
class CalendarEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., pattern="^(call|meeting|demo|follow-up|task)$")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., description="Time in HH:MM format")
    duration: int = Field(default=60, ge=15, le=480)  # 15 minutes to 8 hours
    description: Optional[str] = Field(None, max_length=1000)
    contact_name: Optional[str] = Field(None, alias="contactName", max_length=100)
    contact_email: Optional[str] = Field(None, alias="contactEmail")
    contact_phone: Optional[str] = Field(None, alias="contactPhone", max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    status: str = Field(default="scheduled", pattern="^(scheduled|completed|cancelled)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")

    class Config:
        populate_by_name = True

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None, pattern="^(call|meeting|demo|follow-up|task)$")
    date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format")
    time: Optional[str] = Field(None, description="Time in HH:MM format")
    duration: Optional[int] = Field(None, ge=15, le=480)
    description: Optional[str] = Field(None, max_length=1000)
    contact_name: Optional[str] = Field(None, alias="contactName", max_length=100)
    contact_email: Optional[str] = Field(None, alias="contactEmail")
    contact_phone: Optional[str] = Field(None, alias="contactPhone", max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    status: Optional[str] = Field(None, pattern="^(scheduled|completed|cancelled)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")

    class Config:
        populate_by_name = True

class CalendarEventResponse(BaseModel):
    id: str
    title: str
    type: str
    date: str
    time: str
    duration: int
    description: Optional[str] = None
    contact: Optional[dict] = None
    location: Optional[str] = None
    status: str
    priority: str
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    user_id: str = Field(alias="userId")

    class Config:
        populate_by_name = True

# Task Models
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: str = Field(..., alias="dueDate", description="Due date in YYYY-MM-DD format")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    status: str = Field(default="pending", pattern="^(pending|completed)$")
    category: str = Field(default="other", pattern="^(follow-up|admin|prospecting|other)$")
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    related_lead: Optional[str] = Field(None, alias="relatedLead")

    class Config:
        populate_by_name = True

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    due_date: Optional[str] = Field(None, alias="dueDate", description="Due date in YYYY-MM-DD format")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    status: Optional[str] = Field(None, pattern="^(pending|completed)$")
    category: Optional[str] = Field(None, pattern="^(follow-up|admin|prospecting|other)$")
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    related_lead: Optional[str] = Field(None, alias="relatedLead")

    class Config:
        populate_by_name = True

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: str = Field(alias="dueDate")
    priority: str
    status: str
    category: str
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    related_lead: Optional[str] = Field(None, alias="relatedLead")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    user_id: str = Field(alias="userId")

    class Config:
        populate_by_name = True

class BulkDeleteRequest(BaseModel):
    ids: List[str] = Field(..., min_items=1)

class BulkAssignRequest(BaseModel):
    ids: List[str] = Field(..., min_items=1)
    sales_person_id: str = Field(alias="salesPersonId", min_length=1)

    class Config:
        populate_by_name = True

# Security helper functions
def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_login_attempts(email: str) -> dict:
    """Get login attempts for an email"""
    return await login_attempts_collection.find_one({"email": email}) or {
        "email": email,
        "attempts": 0,
        "locked_until": None,
        "last_attempt": None
    }

async def record_login_attempt(email: str, success: bool, ip_address: str = None):
    """Record login attempt"""
    now = datetime.utcnow()
    
    if success:
        # Reset attempts on successful login
        await login_attempts_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "attempts": 0,
                    "locked_until": None,
                    "last_successful_login": now,
                    "last_ip": ip_address
                }
            },
            upsert=True
        )
    else:
        # Increment failed attempts
        attempts_doc = await get_login_attempts(email)
        new_attempts = attempts_doc["attempts"] + 1
        
        update_data = {
            "attempts": new_attempts,
            "last_attempt": now,
            "last_ip": ip_address
        }
        
        # Lock account if max attempts reached
        if new_attempts >= MAX_LOGIN_ATTEMPTS:
            update_data["locked_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        
        await login_attempts_collection.update_one(
            {"email": email},
            {"$set": update_data},
            upsert=True
        )

async def is_account_locked(email: str) -> bool:
    """Check if account is locked due to failed attempts"""
    attempts_doc = await get_login_attempts(email)
    
    if attempts_doc.get("locked_until"):
        if datetime.utcnow() < attempts_doc["locked_until"]:
            return True
        else:
            # Unlock expired lock
            await login_attempts_collection.update_one(
                {"email": email},
                {
                    "$set": {
                        "attempts": 0,
                        "locked_until": None
                    }
                }
            )
    
    return False

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    
    # Check if user is still active
    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
        )
    
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Ensure current user is admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def calculate_user_achievements(user_id: str):
    """Calculate user's sales and invoice achievements from leads"""
    user_leads = await leads_collection.find({"assigned_to": user_id}).to_list(None)
    
    sales_achieved = sum(lead.get("price", 0) for lead in user_leads)
    invoice_achieved = sum(lead.get("clicks", 0) for lead in user_leads)
    
    return sales_achieved, invoice_achieved

async def update_user_targets_achievements(user_id: str):
    """Update user's target achievements based on their leads"""
    sales_achieved, invoice_achieved = await calculate_user_achievements(user_id)
    
    await targets_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "sales_achieved": sales_achieved,
                "invoice_achieved": invoice_achieved,
                "updated_at": datetime.utcnow().isoformat()
            }
        },
        upsert=False
    )

def format_user_response(user: dict) -> dict:
    """Format user response"""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "status": user.get("status", "active"),
        "last_login": user.get("last_login"),
        "phone_number": user.get("phone_number"),
        "created_at": user.get("created_at")
    }

def format_lead_response(lead: dict) -> dict:
    """Format lead response"""
    return {
        "id": str(lead["_id"]),
        "firstName": lead["first_name"],
        "lastName": lead["last_name"],
        "email": lead["email"],
        "phone": lead.get("phone"),
        "domain": lead["domain"],
        "price": lead["price"],
        "clicks": lead["clicks"],
        "update": lead.get("update", datetime.now().strftime("%b %d")),
        "status": lead["status"],
        "source": lead["source"],
        "assignedTo": lead.get("assigned_to"),
        "notes": lead.get("notes"),
        "createdAt": lead["created_at"]
    }

def format_target_response(target: dict) -> dict:
    """Format target response"""
    return {
        "id": str(target["_id"]),
        "userId": target["user_id"],
        "salesTarget": target["sales_target"],
        "invoiceTarget": target["invoice_target"],
        "salesAchieved": target.get("sales_achieved", 0),
        "invoiceAchieved": target.get("invoice_achieved", 0),
        "period": target["period"],
        "createdAt": target["created_at"],
        "updatedAt": target["updated_at"]
    }

def format_calendar_event_response(event: dict) -> dict:
    """Format calendar event response"""
    contact = None
    if event.get("contact_name") or event.get("contact_email") or event.get("contact_phone"):
        contact = {
            "name": event.get("contact_name"),
            "email": event.get("contact_email"),
            "phone": event.get("contact_phone")
        }
    
    return {
        "id": str(event["_id"]),
        "title": event["title"],
        "type": event["type"],
        "date": event["date"],
        "time": event["time"],
        "duration": event["duration"],
        "description": event.get("description"),
        "contact": contact,
        "location": event.get("location"),
        "status": event["status"],
        "priority": event["priority"],
        "createdAt": event["created_at"],
        "updatedAt": event["updated_at"],
        "userId": event["user_id"]
    }

def format_task_response(task: dict) -> dict:
    """Format task response"""
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "dueDate": task["due_date"],
        "priority": task["priority"],
        "status": task["status"],
        "category": task["category"],
        "assignedTo": task.get("assigned_to"),
        "relatedLead": task.get("related_lead"),
        "createdAt": task["created_at"],
        "updatedAt": task["updated_at"],
        "userId": task["user_id"]
    }

def format_management_response(item: dict) -> dict:
    """Format management item response"""
    formatted = {
        "id": str(item["_id"]),
    }
    # Copy all fields except _id
    for key, value in item.items():
        if key != "_id":
            formatted[key] = value
    return formatted

# Startup event to create indexes and default data
@app.on_event("startup")
async def startup_event():
    print("Starting up application...")
    
    try:
        # Test database connection
        await client.admin.command('ping')
        print("MongoDB connection successful!")
        
        # Create indexes
        await users_collection.create_index("email", unique=True)
        await leads_collection.create_index("email")
        await leads_collection.create_index("domain")
        await leads_collection.create_index("assigned_to")
        await targets_collection.create_index("user_id", unique=True)
        await login_attempts_collection.create_index("email", unique=True)
        await login_attempts_collection.create_index("locked_until", expireAfterSeconds=0)
        
        # Create indexes for new collections
        await calendar_events_collection.create_index("user_id")
        await calendar_events_collection.create_index("date")
        await calendar_events_collection.create_index("status")
        await tasks_collection.create_index("user_id")
        await tasks_collection.create_index("due_date")
        await tasks_collection.create_index("status")
        await tasks_collection.create_index("priority")
        
        print("Database indexes created successfully!")
        
        # Create default admin user if it doesn't exist
        admin_user = await users_collection.find_one({"email": "admin@lead.com"})
        if not admin_user:
            admin_data = {
                "name": "Admin User",
                "email": "admin@lead.com",
                "password": hash_password("AdminPass123!"),
                "role": "admin",
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "last_login": None,
                "phone_number": "+1234567890"
            }
            result = await users_collection.insert_one(admin_data)
            print(f"Default admin user created with ID: {result.inserted_id}")
            print("Default admin credentials: admin@lead.com / AdminPass123!")
        else:
            print("Default admin user already exists")

        # Create default sales user if it doesn't exist
        sales_user = await users_collection.find_one({"email": "sales@lead.com"})
        if not sales_user:
            sales_data = {
                "name": "Sales User",
                "email": "sales@lead.com",
                "password": hash_password("SalesPass123!"),
                "role": "sales",
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "last_login": None,
                "phone_number": "+1234567891"
            }
            result = await users_collection.insert_one(sales_data)
            print(f"Default sales user created with ID: {result.inserted_id}")
            print("Default sales credentials: sales@lead.com / SalesPass123!")
        else:
            print("Default sales user already exists")
            
    except Exception as e:
        print(f"Startup error: {e}")
        raise

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await client.admin.command('ping')
        return {
            "status": "healthy", 
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected",
            "error": str(e)
        }

# Auth endpoints
@app.post("/auth/login")
async def login(user_data: UserLogin):
    """Authenticate user login - supports both admin and sales users"""
    email = user_data.email.lower()
    
    print(f"Login attempt for email: {email}")
    
    # Check if account is locked
    if await is_account_locked(email):
        print(f"Account locked for email: {email}")
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked due to too many failed attempts. Try again in {LOCKOUT_DURATION_MINUTES} minutes."
        )
    
    # Find user
    user = await users_collection.find_one({"email": email})
    print(f"User found: {user is not None}")
    
    # Verify credentials
    if not user or not verify_password(user_data.password, user["password"]):
        print("Invalid credentials")
        await record_login_attempt(email, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    print(f"User role: {user.get('role')}")
    
    # Check if user has valid role (admin or sales)
    if user.get("role") not in ["admin", "sales"]:
        print("User with invalid role attempted login")
        await record_login_attempt(email, False)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role. Please contact your administrator."
        )
    
    # Check if user is active
    if user.get("status") != "active":
        print("Inactive user attempted login")
        await record_login_attempt(email, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    # Record successful login
    await record_login_attempt(email, True)
    
    # Update last login
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now().strftime("%b %d, %Y")}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    print("Login successful")
    
    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": format_user_response(user)
        }
    }

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "success": True,
        "data": format_user_response(current_user)
    }

@app.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user"""
    return {"success": True, "message": "Logged out successfully"}

# User endpoints (Admin only)
@app.get("/users")
async def get_users(current_user: dict = Depends(get_admin_user)):
    try:
        users = await db.users.find({}).to_list(length=None)
        users_data = []
        for user in users:
            user_data = serialize_document(user)
            del user_data["password"]  # Remove password from response
            users_data.append(user_data)
        
        return {"success": True, "data": users_data}
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@app.post("/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_admin_user)):
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new user
        new_user = {
            "name": user_data.name.strip(),
            "email": user_data.email.lower(),
            "password": hash_password(user_data.password),
            "phone_number": user_data.phone_number.strip(),
            "role": user_data.role,
            "status": "active",
            "created_at": datetime.utcnow(),
            "last_login": None
        }
        
        result = await db.users.insert_one(new_user)
        
        # Fetch the created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        user_response = serialize_document(created_user)
        del user_response["password"]
        
        logger.info(f"User created successfully: {user_data.email}")
        return {"success": True, "data": user_response, "message": "User created successfully"}
        
    except HTTPException:
        raise
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already exists")
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user")

@app.put("/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate, current_user: dict = Depends(get_admin_user)):
    try:
        # Validate user_id
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Check if user exists
        existing_user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update data
        update_data = {}
        
        if user_data.name is not None:
            update_data["name"] = user_data.name.strip()
        
        if user_data.email is not None:
            # Check if email is already taken by another user
            email_check = await db.users.find_one({
                "email": user_data.email.lower(),
                "_id": {"$ne": ObjectId(user_id)}
            })
            if email_check:
                raise HTTPException(status_code=400, detail="Email already exists")
            update_data["email"] = user_data.email.lower()
        
        if user_data.phone_number is not None:
            update_data["phone_number"] = user_data.phone_number.strip()
        
        if user_data.role is not None:
            update_data["role"] = user_data.role
        
        if user_data.password is not None and user_data.password.strip():
            update_data["password"] = hash_password(user_data.password)
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Update user
            result = await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="No changes made")
        
        # Fetch updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        user_response = serialize_document(updated_user)
        del user_response["password"]
        
        logger.info(f"User updated successfully: {user_id}")
        return {"success": True, "data": user_response, "message": "User updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user")

@app.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    try:
        # Validate user_id
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Check if user exists
        user_to_delete = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user_to_delete:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent deleting the current user
        if user_id == current_user["id"]:
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
        # Check if user has any leads assigned
        assigned_leads = await db.leads.find({"assignedTo": user_id}).to_list(length=None)
        
        if assigned_leads:
            # Update leads to remove assignment but keep the leads
            await db.leads.update_many(
                {"assignedTo": user_id},
                {"$unset": {"assignedTo": ""}}
            )
            logger.info(f"Unassigned {len(assigned_leads)} leads from user {user_id}")
        
        # Keep targets for historical/calculation purposes - just mark as deleted
        await db.targets.update_one(
            {"userId": user_id},
            {"$set": {"deleted": True, "deleted_at": datetime.utcnow()}}
        )
        
        # Keep calendar events for historical purposes - just mark as deleted
        await db.calendar_events.update_many(
            {"userId": user_id},
            {"$set": {"deleted": True, "deleted_at": datetime.utcnow()}}
        )
        
        # Delete the user
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="Failed to delete user")
        
        logger.info(f"User deleted successfully: {user_id}")
        return {
            "success": True, 
            "message": "User deleted successfully",
            "details": {
                "leads_unassigned": len(assigned_leads),
                "targets_archived": True,
                "events_archived": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")


@app.get("/salespeople")
async def get_salespeople(current_user: dict = Depends(get_current_user)):
    """Get sales team members"""
    salespeople = await users_collection.find({"role": {"$in": ["sales", "admin"]}}).to_list(None)
    return {
        "success": True,
        "data": [format_user_response(user) for user in salespeople]
    }

# Target endpoints
@app.get("/targets")
async def get_all_targets(current_user: dict = Depends(get_admin_user)):
    """Get all user targets (Admin only)"""
    targets = await targets_collection.find({}).to_list(None)
    return {
        "success": True,
        "data": [format_target_response(target) for target in targets]
    }

@app.get("/targets/{user_id}")
async def get_user_targets(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get targets for a specific user"""
    # Check if current user can access these targets
    if current_user.get("role") != "admin" and str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own targets"
        )
    
    target = await targets_collection.find_one({"user_id": user_id})
    if not target:
        # Return default empty targets
        return {
            "success": True,
            "data": {
                "userId": user_id,
                "salesTarget": 0,
                "invoiceTarget": 0,
                "salesAchieved": 0,
                "invoiceAchieved": 0,
                "period": "monthly"
            }
        }
    
    return {
        "success": True,
        "data": format_target_response(target)
    }

@app.post("/targets")
async def create_or_update_targets(target_data: TargetCreate, current_user: dict = Depends(get_admin_user)):
    """Create or update user targets (Admin only)"""
    try:
        # Verify the user exists
        user = await users_collection.find_one({"_id": ObjectId(target_data.user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Calculate current achievements
        sales_achieved, invoice_achieved = await calculate_user_achievements(target_data.user_id)
        
        target_dict = {
            "user_id": target_data.user_id,
            "sales_target": target_data.sales_target,
            "invoice_target": target_data.invoice_target,
            "sales_achieved": sales_achieved,
            "invoice_achieved": invoice_achieved,
            "period": target_data.period,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": str(current_user["_id"])
        }
        
        # Check if target already exists
        existing_target = await targets_collection.find_one({"user_id": target_data.user_id})
        
        if existing_target:
            # Update existing target
            result = await targets_collection.update_one(
                {"user_id": target_data.user_id},
                {"$set": target_dict}
            )
            target_dict["_id"] = existing_target["_id"]
            target_dict["created_at"] = existing_target["created_at"]
        else:
            # Create new target
            target_dict["created_at"] = datetime.utcnow().isoformat()
            result = await targets_collection.insert_one(target_dict)
            target_dict["_id"] = result.inserted_id
        
        return {
            "success": True,
            "data": format_target_response(target_dict),
            "message": "Targets updated successfully"
        }
        
    except Exception as e:
        print(f"Error creating/updating targets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update targets"
        )

@app.put("/targets/{user_id}")
async def update_targets(user_id: str, target_data: TargetUpdate, current_user: dict = Depends(get_admin_user)):
    """Update user targets (Admin only)"""
    try:
        # Verify the user exists
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get existing target
        existing_target = await targets_collection.find_one({"user_id": user_id})
        if not existing_target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target not found for this user"
            )
        
        # Calculate current achievements
        sales_achieved, invoice_achieved = await calculate_user_achievements(user_id)
        
        update_data = {
            "sales_achieved": sales_achieved,
            "invoice_achieved": invoice_achieved,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": str(current_user["_id"])
        }
        
        # Update only provided fields
        if target_data.sales_target is not None:
            update_data["sales_target"] = target_data.sales_target
        if target_data.invoice_target is not None:
            update_data["invoice_target"] = target_data.invoice_target
        if target_data.period is not None:
            update_data["period"] = target_data.period
        
        result = await targets_collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target not found"
            )
        
        # Get updated target
        updated_target = await targets_collection.find_one({"user_id": user_id})
        
        return {
            "success": True,
            "data": format_target_response(updated_target),
            "message": "Targets updated successfully"
        }
        
    except Exception as e:
        print(f"Error updating targets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update targets"
        )

@app.delete("/targets/{user_id}")
async def delete_targets(user_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete user targets (Admin only)"""
    result = await targets_collection.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target not found"
        )
    
    return {
        "success": True,
        "message": "Targets deleted successfully"
    }

# Calendar Events endpoints
@app.get("/calendar/events")
async def get_calendar_events(current_user: dict = Depends(get_current_user)):
    """Get calendar events for current user"""
    events = await calendar_events_collection.find({"user_id": str(current_user["_id"])}).to_list(None)
    return {
        "success": True,
        "data": [format_calendar_event_response(event) for event in events]
    }

@app.post("/calendar/events")
async def create_calendar_event(event_data: CalendarEventCreate, current_user: dict = Depends(get_current_user)):
    """Create new calendar event"""
    event_dict = {
        "title": event_data.title,
        "type": event_data.type,
        "date": event_data.date,
        "time": event_data.time,
        "duration": event_data.duration,
        "description": event_data.description,
        "contact_name": event_data.contact_name,
        "contact_email": event_data.contact_email,
        "contact_phone": event_data.contact_phone,
        "location": event_data.location,
        "status": event_data.status,
        "priority": event_data.priority,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "created_by": str(current_user["_id"])
    }
    
    result = await calendar_events_collection.insert_one(event_dict)
    event_dict["_id"] = result.inserted_id
    
    return {
        "success": True,
        "data": format_calendar_event_response(event_dict),
        "message": "Calendar event created successfully"
    }

@app.put("/calendar/events/{event_id}")
async def update_calendar_event(event_id: str, event_data: CalendarEventUpdate, current_user: dict = Depends(get_current_user)):
    """Update calendar event"""
    try:
        object_id = ObjectId(event_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid event ID")
    
    # Check if event exists and user has permission
    event = await calendar_events_collection.find_one({"_id": object_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user owns the event
    if event.get("user_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own events"
        )
    
    update_data = {k: v for k, v in event_data.dict(exclude_unset=True, by_alias=True).items() if v is not None}
    
    # Convert camelCase to snake_case for database
    field_mapping = {
        "contactName": "contact_name",
        "contactEmail": "contact_email",
        "contactPhone": "contact_phone"
    }
    
    db_update_data = {}
    for key, value in update_data.items():
        db_key = field_mapping.get(key, key)
        db_update_data[db_key] = value
    
    if db_update_data:
        db_update_data["updated_at"] = datetime.utcnow().isoformat()
        db_update_data["updated_by"] = str(current_user["_id"])
        
        result = await calendar_events_collection.update_one(
            {"_id": object_id},
            {"$set": db_update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
    
    updated_event = await calendar_events_collection.find_one({"_id": object_id})
    
    return {
        "success": True,
        "data": format_calendar_event_response(updated_event),
        "message": "Event updated successfully"
    }

@app.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str, current_user: dict = Depends(get_current_user)):
    """Delete calendar event"""
    try:
        object_id = ObjectId(event_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid event ID")
    
    # Check if event exists and user has permission
    event = await calendar_events_collection.find_one({"_id": object_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user owns the event
    if event.get("user_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own events"
        )
    
    result = await calendar_events_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {
        "success": True,
        "message": "Event deleted successfully"
    }

# Tasks endpoints
@app.get("/tasks")
async def get_tasks(current_user: dict = Depends(get_current_user)):
    """Get tasks for current user"""
    tasks = await tasks_collection.find({"user_id": str(current_user["_id"])}).to_list(None)
    return {
        "success": True,
        "data": [format_task_response(task) for task in tasks]
    }

@app.post("/tasks")
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create new task"""
    task_dict = {
        "title": task_data.title,
        "description": task_data.description,
        "due_date": task_data.due_date,
        "priority": task_data.priority,
        "status": task_data.status,
        "category": task_data.category,
        "assigned_to": task_data.assigned_to,
        "related_lead": task_data.related_lead,
        "user_id": str(current_user["_id"]),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "created_by": str(current_user["_id"])
    }
    
    result = await tasks_collection.insert_one(task_dict)
    task_dict["_id"] = result.inserted_id
    
    return {
        "success": True,
        "data": format_task_response(task_dict),
        "message": "Task created successfully"
    }

@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task_data: TaskUpdate, current_user: dict = Depends(get_current_user)):
    """Update task"""
    try:
        object_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    # Check if task exists and user has permission
    task = await tasks_collection.find_one({"_id": object_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user owns the task
    if task.get("user_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own tasks"
        )
    
    update_data = {k: v for k, v in task_data.dict(exclude_unset=True, by_alias=True).items() if v is not None}
    
    # Convert camelCase to snake_case for database
    field_mapping = {
        "dueDate": "due_date",
        "assignedTo": "assigned_to",
        "relatedLead": "related_lead"
    }
    
    db_update_data = {}
    for key, value in update_data.items():
        db_key = field_mapping.get(key, key)
        db_update_data[db_key] = value
    
    if db_update_data:
        db_update_data["updated_at"] = datetime.utcnow().isoformat()
        db_update_data["updated_by"] = str(current_user["_id"])
        
        result = await tasks_collection.update_one(
            {"_id": object_id},
            {"$set": db_update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await tasks_collection.find_one({"_id": object_id})
    
    return {
        "success": True,
        "data": format_task_response(updated_task),
        "message": "Task updated successfully"
    }

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete task"""
    try:
        object_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    # Check if task exists and user has permission
    task = await tasks_collection.find_one({"_id": object_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user owns the task
    if task.get("user_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tasks"
        )
    
    result = await tasks_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "success": True,
        "message": "Task deleted successfully"
    }

# Lead endpoints with role-based access control
@app.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    """Get leads based on user role"""
    if current_user.get("role") == "admin":
        # Admin can see all leads
        leads = await leads_collection.find({}).to_list(None)
    else:
        # Sales users can only see their assigned leads
        leads = await leads_collection.find({"assigned_to": str(current_user["_id"])}).to_list(None)
    
    return {
        "success": True,
        "data": [format_lead_response(lead) for lead in leads]
    }

@app.post("/leads")
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    """Create new lead"""
    lead_dict = {
        "first_name": lead_data.first_name,
        "last_name": lead_data.last_name,
        "email": lead_data.email.lower(),
        "phone": lead_data.phone,
        "domain": lead_data.domain,
        "price": lead_data.price,
        "clicks": lead_data.clicks,
        "status": lead_data.status,
        "source": lead_data.source,
        "assigned_to": lead_data.assigned_to,
        "notes": lead_data.notes,
        "update": datetime.now().strftime("%b %d"),
        "created_at": datetime.utcnow().isoformat(),
        "created_by": str(current_user["_id"])
    }
    
    result = await leads_collection.insert_one(lead_dict)
    lead_dict["_id"] = result.inserted_id
    
    # Update target achievements if lead is assigned
    if lead_data.assigned_to:
        await update_user_targets_achievements(lead_data.assigned_to)
    
    return {
        "success": True,
        "data": format_lead_response(lead_dict),
        "message": "Lead created successfully"
    }

@app.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead_data: LeadUpdate, current_user: dict = Depends(get_current_user)):
    """Update lead with role-based access control"""
    try:
        object_id = ObjectId(lead_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    
    # Check if lead exists and user has permission
    lead = await leads_collection.find_one({"_id": object_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Store old assigned user for target updates
    old_assigned_to = lead.get("assigned_to")
    
    # Role-based access control
    if current_user.get("role") == "sales":
        # Sales users can only update their assigned leads
        if lead.get("assigned_to") != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update leads assigned to you"
            )
    
    update_data = {k: v for k, v in lead_data.dict(exclude_unset=True, by_alias=True).items() if v is not None}
    
    # Convert camelCase to snake_case for database
    field_mapping = {
        "firstName": "first_name",
        "lastName": "last_name",
        "assignedTo": "assigned_to"
    }
    
    db_update_data = {}
    for key, value in update_data.items():
        db_key = field_mapping.get(key, key)
        if key == "email" and value:
            value = value.lower()
        db_update_data[db_key] = value
    
    if db_update_data:
        db_update_data["updated_at"] = datetime.utcnow().isoformat()
        db_update_data["update"] = datetime.now().strftime("%b %d")
        db_update_data["updated_by"] = str(current_user["_id"])
        
        result = await leads_collection.update_one(
            {"_id": object_id},
            {"$set": db_update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
    
    updated_lead = await leads_collection.find_one({"_id": object_id})
    new_assigned_to = updated_lead.get("assigned_to")
    
    # Update target achievements for affected users
    users_to_update = set()
    if old_assigned_to:
        users_to_update.add(old_assigned_to)
    if new_assigned_to:
        users_to_update.add(new_assigned_to)
    
    for user_id in users_to_update:
        await update_user_targets_achievements(user_id)
    
    return {
        "success": True,
        "data": format_lead_response(updated_lead),
        "message": "Lead updated successfully"
    }

@app.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Delete lead with role-based access control"""
    try:
        object_id = ObjectId(lead_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    
    # Check if lead exists and user has permission
    lead = await leads_collection.find_one({"_id": object_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    assigned_to = lead.get("assigned_to")
    
    # Role-based access control
    if current_user.get("role") == "sales":
        # Sales users can only delete their assigned leads
        if lead.get("assigned_to") != str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete leads assigned to you"
            )
    
    result = await leads_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Update target achievements if lead was assigned
    if assigned_to:
        await update_user_targets_achievements(assigned_to)
    
    return {
        "success": True,
        "message": "Lead deleted successfully"
    }

@app.post("/leads/bulk-delete")
async def bulk_delete_leads(request: BulkDeleteRequest, current_user: dict = Depends(get_current_user)):
    """Bulk delete leads with role-based access control"""
    try:
        object_ids = [ObjectId(id) for id in request.ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid lead IDs")
    
    # Get leads to check permissions and track assigned users
    leads = await leads_collection.find({"_id": {"$in": object_ids}}).to_list(None)
    assigned_users = set()
    
    # Role-based access control
    if current_user.get("role") == "sales":
        # Sales users can only delete their assigned leads
        for lead in leads:
            if lead.get("assigned_to") != str(current_user["_id"]):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete leads assigned to you"
                )
            if lead.get("assigned_to"):
                assigned_users.add(lead["assigned_to"])
    else:
        # Admin can delete any leads, track all assigned users
        for lead in leads:
            if lead.get("assigned_to"):
                assigned_users.add(lead["assigned_to"])
    
    result = await leads_collection.delete_many({"_id": {"$in": object_ids}})
    
    # Update target achievements for all affected users
    for user_id in assigned_users:
        await update_user_targets_achievements(user_id)
    
    return {
        "success": True,
        "message": f"{result.deleted_count} leads deleted successfully"
    }

@app.post("/leads/bulk-assign")
async def bulk_assign_leads(request: BulkAssignRequest, current_user: dict = Depends(get_admin_user)):
    """Bulk assign leads (Admin only)"""
    try:
        object_ids = [ObjectId(id) for id in request.ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid lead IDs")
    
    # Get leads to track old assignments
    leads = await leads_collection.find({"_id": {"$in": object_ids}}).to_list(None)
    old_assigned_users = set()
    for lead in leads:
        if lead.get("assigned_to"):
            old_assigned_users.add(lead["assigned_to"])
    
    result = await leads_collection.update_many(
        {"_id": {"$in": object_ids}},
        {
            "$set": {
                "assigned_to": request.sales_person_id,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": str(current_user["_id"])
            }
        }
    )
    
    # Update target achievements for all affected users
    affected_users = old_assigned_users.copy()
    affected_users.add(request.sales_person_id)
    
    for user_id in affected_users:
        await update_user_targets_achievements(user_id)
    
    return {
        "success": True,
        "message": f"{result.modified_count} leads assigned successfully"
    }

# Management endpoints (Admin only)
@app.get("/management/{item_type}")
async def get_management_items(item_type: str, current_user: dict = Depends(get_admin_user)):
    """Get management items (Admin only)"""
    collection_map = {
        "brands": brands_collection,
        "products": products_collection,
        "locations": locations_collection,
        "statuses": statuses_collection,
        "sources": sources_collection,
        "ownership": ownership_collection
    }
    
    if item_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    collection = collection_map[item_type]
    items = await collection.find({}).to_list(None)
    
    return {
        "success": True,
        "data": [format_management_response(item) for item in items]
    }

@app.post("/management/{item_type}")
async def create_management_item(item_type: str, item_data: dict, current_user: dict = Depends(get_admin_user)):
    """Create management item (Admin only)"""
    collection_map = {
        "brands": brands_collection,
        "products": products_collection,
        "locations": locations_collection,
        "statuses": statuses_collection,
        "sources": sources_collection,
        "ownership": ownership_collection
    }
    
    if item_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    collection = collection_map[item_type]
    
    # Add metadata
    item_data["created_at"] = datetime.utcnow().isoformat()
    item_data["created_by"] = str(current_user["_id"])
    item_data["updated_at"] = datetime.utcnow().isoformat()
    
    try:
        result = await collection.insert_one(item_data)
        item_data["_id"] = result.inserted_id
        
        return {
            "success": True,
            "data": format_management_response(item_data),
            "message": f"{item_type.capitalize()[:-1]} created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create {item_type[:-1]}: {str(e)}"
        )

@app.put("/management/{item_type}/{item_id}")
async def update_management_item(item_type: str, item_id: str, item_data: dict, current_user: dict = Depends(get_admin_user)):
    """Update management item (Admin only)"""
    collection_map = {
        "brands": brands_collection,
        "products": products_collection,
        "locations": locations_collection,
        "statuses": statuses_collection,
        "sources": sources_collection,
        "ownership": ownership_collection
    }
    
    if item_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    try:
        object_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    collection = collection_map[item_type]
    
    # Add update metadata
    item_data["updated_at"] = datetime.utcnow().isoformat()
    item_data["updated_by"] = str(current_user["_id"])
    
    # Remove id from update data if present
    if "id" in item_data:
        del item_data["id"]
    
    try:
        result = await collection.update_one(
            {"_id": object_id},
            {"$set": item_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"{item_type.capitalize()[:-1]} not found")
        
        # Get updated item
        updated_item = await collection.find_one({"_id": object_id})
        
        return {
            "success": True,
            "data": format_management_response(updated_item),
            "message": f"{item_type.capitalize()[:-1]} updated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update {item_type[:-1]}: {str(e)}"
        )

@app.delete("/management/{item_type}/{item_id}")
async def delete_management_item(item_type: str, item_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete management item (Admin only)"""
    collection_map = {
        "brands": brands_collection,
        "products": products_collection,
        "locations": locations_collection,
        "statuses": statuses_collection,
        "sources": sources_collection,
        "ownership": ownership_collection
    }
    
    if item_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    try:
        object_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid item ID")
    
    collection = collection_map[item_type]
    
    try:
        result = await collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"{item_type.capitalize()[:-1]} not found")
        
        return {
            "success": True,
            "message": f"{item_type.capitalize()[:-1]} deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete {item_type[:-1]}: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)