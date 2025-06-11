# ZownLead CRM Backend

FastAPI backend with MongoDB Atlas integration for the ZownLead CRM system.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your MongoDB Atlas connection string:
```
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/crm_database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
```

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.

2. **Create a Cluster**: 
   - Click "Build a Database"
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Create the cluster

3. **Create a Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password
   - Give the user "Read and write to any database" privileges

4. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your specific IP addresses

5. **Get Connection String**:
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `crm_database`

### 4. Run the Backend

```bash
python run.py
```

The API will be available at `http://localhost:8000`

### 5. API Documentation

Once the server is running, you can access:
- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc

### 6. Frontend Configuration

Update your frontend `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Default Login Credentials

The system creates a default admin user:
- **Email**: admin@lead.com
- **Password**: password

## Database Collections

The backend automatically creates the following collections:
- `users` - User accounts and authentication
- `leads` - Lead management data
- `brands` - Brand configuration
- `products` - Product catalog
- `locations` - Location settings
- `statuses` - Custom lead statuses
- `sources` - Lead sources
- `ownership` - Lead ownership rules

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - User logout

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /salespeople` - Get sales team members

### Leads
- `GET /leads` - Get all leads
- `POST /leads` - Create new lead
- `PUT /leads/{id}` - Update lead
- `DELETE /leads/{id}` - Delete lead
- `POST /leads/bulk-delete` - Delete multiple leads
- `POST /leads/bulk-assign` - Assign multiple leads

### Management
- `GET /management/{type}` - Get management items (brands, products, etc.)
- `POST /management/{type}` - Create management item

## Features

- **Automatic Database Creation**: Collections and indexes are created automatically
- **Data Validation**: Pydantic models ensure data integrity
- **Authentication**: JWT-based authentication system
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error responses
- **Bulk Operations**: Support for bulk lead operations
- **Flexible Schema**: MongoDB's flexible schema adapts to your data needs

## Development

The backend uses:
- **FastAPI**: Modern, fast web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and serialization
- **JWT**: Secure authentication
- **Bcrypt**: Password hashing

## Production Deployment

For production deployment:
1. Set secure JWT secret
2. Configure proper CORS origins
3. Use environment-specific MongoDB connection
4. Set up proper logging
5. Use a production ASGI server like Gunicorn with Uvicorn workers