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
from pydantic import BaseModel, Field
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="ZownLead CRM API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173", "http://localhost:3000"],  # Added HTTPS origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")

if not MONGODB_CONNECTION_STRING:
    raise ValueError("MONGODB_CONNECTION_STRING environment variable is required")

client = AsyncIOMotorClient(MONGODB_CONNECTION_STRING)
db = client.crm_database

# Collections
users_collection = db.users
leads_collection = db.leads
brands_collection = db.brands
products_collection = db.products
locations_collection = db.locations
statuses_collection = db.statuses
sources_collection = db.sources
ownership_collection = db.ownership

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "sales"
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str = "active"
    last_login: Optional[str] = None
    phone_number: Optional[str] = None

class LeadCreate(BaseModel):
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    email: str
    phone: Optional[str] = None
    domain: str
    price: float = 0
    clicks: int = 0
    status: str = "new"
    source: str = "website"
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class LeadUpdate(BaseModel):
    first_name: Optional[str] = Field(None, alias="firstName")
    last_name: Optional[str] = Field(None, alias="lastName")
    email: Optional[str] = None
    phone: Optional[str] = None
    domain: Optional[str] = None
    price: Optional[float] = None
    clicks: Optional[int] = None
    status: Optional[str] = None
    source: Optional[str] = None
    assigned_to: Optional[str] = Field(None, alias="assignedTo")
    notes: Optional[str] = None

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
    ids: List[str]

class BulkAssignRequest(BaseModel):
    ids: List[str]
    sales_person_id: str = Field(alias="salesPersonId")

    class Config:
        populate_by_name = True

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

def format_user_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "status": user.get("status", "active"),
        "last_login": user.get("last_login"),
        "phone_number": user.get("phone_number")
    }

def format_lead_response(lead: dict) -> dict:
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

# Startup event to create indexes and default data
@app.on_event("startup")
async def startup_event():
    # Create indexes
    await users_collection.create_index("email", unique=True)
    await leads_collection.create_index("email")
    await leads_collection.create_index("domain")
    
    # Create default admin user if it doesn't exist
    admin_user = await users_collection.find_one({"email": "admin@lead.com"})
    if not admin_user:
        admin_data = {
            "name": "Admin User",
            "email": "admin@lead.com",
            "password": hash_password("password"),
            "role": "admin",
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "last_login": datetime.now().strftime("%b %d, %Y")
        }
        await users_collection.insert_one(admin_data)
        print("Default admin user created: admin@lead.com / password")

# Auth endpoints
@app.post("/auth/login")
async def login(user_data: UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Update last login
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now().strftime("%b %d, %Y")}}
    )
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
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
    return {
        "success": True,
        "data": format_user_response(current_user)
    }

@app.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}

# User endpoints
@app.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    users = await users_collection.find({}).to_list(None)
    return {
        "success": True,
        "data": [format_user_response(user) for user in users]
    }

@app.post("/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    try:
        user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hash_password(user_data.password),
            "role": user_data.role,
            "status": "active",
            "phone_number": user_data.phone_number,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": None
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
    salespeople = await users_collection.find({"role": {"$in": ["sales", "admin"]}}).to_list(None)
    return {
        "success": True,
        "data": [format_user_response(user) for user in salespeople]
    }

# Lead endpoints
@app.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    leads = await leads_collection.find({}).to_list(None)
    return {
        "success": True,
        "data": [format_lead_response(lead) for lead in leads]
    }

@app.post("/leads")
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    lead_dict = {
        "first_name": lead_data.first_name,
        "last_name": lead_data.last_name,
        "email": lead_data.email,
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
        db_update_data[db_key] = value
    
    if db_update_data:
        db_update_data["updated_at"] = datetime.utcnow().isoformat()
        db_update_data["update"] = datetime.now().strftime("%b %d")
        
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
    try:
        object_ids = [ObjectId(id) for id in request.ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid lead IDs")
    
    result = await leads_collection.update_many(
        {"_id": {"$in": object_ids}},
        {"$set": {"assigned_to": request.sales_person_id, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    return {
        "success": True,
        "message": f"{result.modified_count} leads assigned successfully"
    }

# Management endpoints (brands, products, etc.)
@app.get("/management/{item_type}")
async def get_management_items(item_type: str, current_user: dict = Depends(get_current_user)):
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
    
    # Convert ObjectId to string
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
    
    return {
        "success": True,
        "data": items
    }

@app.post("/management/{item_type}")
async def create_management_item(item_type: str, item_data: dict, current_user: dict = Depends(get_current_user)):
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
    item_data["created_at"] = datetime.utcnow().isoformat()
    item_data["created_by"] = str(current_user["_id"])
    
    result = await collection.insert_one(item_data)
    item_data["id"] = str(result.inserted_id)
    del item_data["_id"]
    
    return {
        "success": True,
        "data": item_data,
        "message": f"{item_type.capitalize()} item created successfully"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)