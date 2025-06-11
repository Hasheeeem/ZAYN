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
        await login_attempts_collection.create_index("email", unique=True)
        await login_attempts_collection.create_index("locked_until", expireAfterSeconds=0)
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
    """Authenticate user login"""
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
    
    # Check if user is admin
    if user.get("role") != "admin":
        print("Non-admin user attempted login")
        await record_login_attempt(email, False)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Only administrators can access this system."
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
    """Get all users (Admin only)"""
    users = await users_collection.find({}).to_list(None)
    return {
        "success": True,
        "data": [format_user_response(user) for user in users]
    }

@app.post("/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_admin_user)):
    """Create new user (Admin only)"""
    try:
        user_dict = {
            "name": user_data.name,
            "email": user_data.email.lower(),
            "password": hash_password(user_data.password),
            "role": user_data.role,
            "status": "active",
            "phone_number": user_data.phone_number,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": None,
            "created_by": str(current_user["_id"])
        }
        
        result = await users_collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return {
            "success": True,
            "data": format_user_response(user_dict),
            "message": "User created successfully"
        }
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

@app.get("/salespeople")
async def get_salespeople(current_user: dict = Depends(get_current_user)):
    """Get sales team members"""
    salespeople = await users_collection.find({"role": {"$in": ["sales", "admin"]}}).to_list(None)
    return {
        "success": True,
        "data": [format_user_response(user) for user in salespeople]
    }

# Lead endpoints
@app.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    """Get all leads"""
    leads = await leads_collection.find({}).to_list(None)
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
    
    return {
        "success": True,
        "data": format_lead_response(lead_dict),
        "message": "Lead created successfully"
    }

@app.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead_data: LeadUpdate, current_user: dict = Depends(get_current_user)):
    """Update lead"""
    try:
        object_id = ObjectId(lead_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    
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
    return {
        "success": True,
        "data": format_lead_response(updated_lead),
        "message": "Lead updated successfully"
    }

@app.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Delete lead"""
    try:
        object_id = ObjectId(lead_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid lead ID")
    
    result = await leads_collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return {
        "success": True,
        "message": "Lead deleted successfully"
    }

@app.post("/leads/bulk-delete")
async def bulk_delete_leads(request: BulkDeleteRequest, current_user: dict = Depends(get_current_user)):
    """Bulk delete leads"""
    try:
        object_ids = [ObjectId(id) for id in request.ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid lead IDs")
    
    result = await leads_collection.delete_many({"_id": {"$in": object_ids}})
    
    return {
        "success": True,
        "message": f"{result.deleted_count} leads deleted successfully"
    }

@app.post("/leads/bulk-assign")
async def bulk_assign_leads(request: BulkAssignRequest, current_user: dict = Depends(get_current_user)):
    """Bulk assign leads"""
    try:
        object_ids = [ObjectId(id) for id in request.ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid lead IDs")
    
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