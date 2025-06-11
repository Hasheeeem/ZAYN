# ZownLead CRM Backend - Secure Authentication System

FastAPI backend with MongoDB Atlas integration and enterprise-grade security for the ZownLead CRM system.

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** with secure token generation
- **Admin-only access** - Only users with admin role can login
- **Account lockout protection** - Automatic lockout after 5 failed attempts
- **Password security** - Strong password requirements with validation
- **Session management** - Secure token handling and expiration

### Security Measures
- **Password hashing** using bcrypt with salt
- **Rate limiting** on login attempts
- **Input validation** with Pydantic models
- **SQL injection protection** through MongoDB ODM
- **CORS configuration** for secure cross-origin requests
- **Error handling** without information leakage

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

2. Update the `.env` file with your configuration:
```env
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/crm_database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
ENVIRONMENT=development
```

**Important**: Generate a secure JWT secret for production:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a Cluster**: 
   - Choose "Shared" (free tier) for development
   - Select your preferred cloud provider and region

3. **Create a Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Give the user "Read and write to any database" privileges

4. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - For development: "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Get Connection String**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string and replace placeholders

### 4. Run the Backend

```bash
python run.py
```

The API will be available at `http://localhost:8000`

### 5. API Documentation

- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc

## 🔑 Default Admin Credentials

**Development Only** (Change in production):
- **Email**: admin@lead.com
- **Password**: AdminPass123!

## 🛡️ Security Configuration

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- Special characters recommended

### Account Lockout Policy
- **Max attempts**: 5 failed login attempts
- **Lockout duration**: 30 minutes
- **Auto-unlock**: Automatic after lockout period expires

### JWT Token Configuration
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Refresh**: Manual re-authentication required

## 📊 Database Collections

The system automatically creates these collections:

### Core Collections
- `users` - User accounts with role-based access
- `leads` - Lead management data
- `login_attempts` - Security audit trail

### Management Collections
- `brands` - Brand configuration
- `products` - Product catalog
- `locations` - Location settings
- `statuses` - Custom lead statuses
- `sources` - Lead sources
- `ownership` - Lead ownership rules

## 🔒 API Security

### Protected Endpoints
All endpoints except `/auth/login` and `/health` require authentication.

### Role-Based Access Control
- **Admin Only**: User management, system configuration
- **Admin + Sales**: Lead management, reports
- **Public**: Login, health check

### Request Validation
- Input sanitization with Pydantic
- Email format validation
- Data type enforcement
- Length restrictions

## 🚀 Production Deployment

### Security Checklist
- [ ] Change default admin credentials
- [ ] Generate secure JWT secret
- [ ] Configure specific CORS origins
- [ ] Set up MongoDB IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Configure HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Environment Variables
```env
MONGODB_CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=<secure-random-key>
ENVIRONMENT=production
```

### Recommended Production Setup
- Use environment-specific MongoDB clusters
- Implement API rate limiting
- Set up log aggregation
- Configure backup strategies
- Monitor security events

## 🔍 Monitoring & Logging

### Security Events Logged
- Login attempts (successful/failed)
- Account lockouts
- Token generation/validation
- Admin actions
- Data modifications

### Health Monitoring
- Database connectivity
- API response times
- Error rates
- Security incidents

## 🛠️ Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Code Quality
```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## 📞 Support

For security issues or questions:
1. Check the documentation
2. Review error logs
3. Verify environment configuration
4. Contact system administrator

## 🔄 Updates

Keep the system secure by:
- Regularly updating dependencies
- Monitoring security advisories
- Reviewing access logs
- Updating passwords periodically