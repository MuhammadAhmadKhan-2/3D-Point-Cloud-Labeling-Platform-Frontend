# Enterprise Point Cloud Platform - MongoDB Admin Panel

A comprehensive admin panel application built with Node.js, Express.js, MongoDB, and React with complete user management functionality.

## 🚀 Features

### Authentication System
- **Secure Admin Login**: Accessible only via `/admin` route
- **Hardcoded Credentials**: `muhammadahmaddd8@gmail.com` / `12345678`
- **Session-based Authentication**: Secure middleware with auto-redirect
- **Account Security**: Login attempt limiting and account locking

### User Management System
- **Full CRUD Operations**: Create, Read, Update, Delete users
- **Advanced Search & Filtering**: By name, email, user type, and status
- **User Types**: Client, QA/QC Vendor, Preprocessing Vendor
- **Status Management**: Active, Inactive, Pending, Suspended
- **Bulk Operations**: Multiple user management

### Admin Profile Management
- **Profile Editing**: Update name and email
- **Password Management**: Secure password change with validation
- **Session Management**: Secure logout with cleanup

### Database & Security
- **MongoDB with Mongoose**: Native implementation with proper schemas
- **Security Middleware**: Helmet, CORS, rate limiting, input sanitization
- **Data Validation**: Comprehensive server-side validation with Joi
- **Error Handling**: Proper HTTP status codes and user feedback

## 📁 Project Structure

```
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   └── Admin.js             # Admin schema
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   └── userController.js    # User management logic
│   │   ├── middleware/
│   │   │   ├── auth.js              # Authentication middleware
│   │   │   └── validation.js        # Input validation
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   ├── userRoutes.js        # User endpoints
│   │   │   └── index.js             # Route aggregation
│   │   └── server.js                # Express server
│   ├── package.json
│   └── .env
├── src/
│   ├── pages/
│   │   ├── AdminLogin.tsx           # Admin login page
│   │   └── AdminDashboard.tsx       # Main admin dashboard
│   └── App.tsx
└── README.md
```

## 🛠 Installation Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd enterprise-point-cloud-platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string from "Connect" → "Connect your application"
4. Replace `<password>` and `<dbname>` in connection string

### 3. Environment Configuration

Create `.env` file in `server/` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/enterprise_point_cloud
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/enterprise_point_cloud

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
SESSION_NAME=admin_session

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Credentials
ADMIN_EMAIL=muhammadahmaddd8@gmail.com
ADMIN_PASSWORD=12345678

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Application

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend (in project root)
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API Health**: http://localhost:5000/api/health

## 📊 MongoDB Compass Setup

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using:
   - **Local**: `mongodb://localhost:27017`
   - **Atlas**: Use connection string from Atlas dashboard
3. Navigate to `enterprise_point_cloud` database
4. View collections: `users`, `admins`, `sessions`

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login admin user
```json
{
  "email": "muhammadahmaddd8@gmail.com",
  "password": "12345678"
}
```

#### POST `/api/auth/logout`
Logout current admin (requires authentication)

#### GET `/api/auth/check`
Check authentication status

#### GET `/api/auth/profile`
Get admin profile (requires authentication)

#### PUT `/api/auth/profile`
Update admin profile (requires authentication)
```json
{
  "name": "Administrator",
  "email": "admin@example.com"
}
```

#### PUT `/api/auth/change-password`
Change admin password (requires authentication)
```json
{
  "currentPassword": "current123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### User Management Endpoints

#### GET `/api/users`
Get all users with pagination and filtering
- Query parameters: `page`, `limit`, `search`, `userType`, `status`, `sortBy`, `sortOrder`

#### GET `/api/users/:id`
Get single user by ID

#### POST `/api/users`
Create new user (requires authentication)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "userType": "CLIENT",
  "status": "ACTIVE",
  "company": "Example Corp",
  "phone": "+1234567890",
  "department": "Engineering",
  "notes": "VIP client"
}
```

#### PUT `/api/users/:id`
Update user (requires authentication)

#### DELETE `/api/users/:id`
Delete user (requires authentication)

#### POST `/api/users/bulk-delete`
Delete multiple users (requires authentication)
```json
{
  "userIds": ["id1", "id2", "id3"]
}
```

#### PATCH `/api/users/:id/status`
Update user status (requires authentication)
```json
{
  "status": "SUSPENDED"
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **Session Security**: Secure HTTP-only cookies
- **Rate Limiting**: Login attempt protection
- **Input Sanitization**: XSS and injection protection
- **CORS Protection**: Configured for frontend domain
- **Account Locking**: After 5 failed login attempts
- **Comprehensive Validation**: Server-side input validation

## 🎨 UI Features

- **Responsive Design**: Works on all screen sizes
- **Real-time Notifications**: Success/error feedback
- **Loading States**: User-friendly loading indicators
- **Confirmation Dialogs**: Prevent accidental actions
- **Advanced Search**: Multi-field search and filtering
- **Modal Forms**: Clean user creation/editing interface
- **Animated Background**: Consistent with existing design

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong `SESSION_SECRET`
3. Configure MongoDB Atlas for production
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging
7. Configure backup strategies

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Session Issues
- Clear browser cookies for localhost
- Restart both frontend and backend servers
- Check `.env` file configuration

## 📝 Default Admin Credentials

- **Email**: `muhammadahmaddd8@gmail.com`
- **Password**: `12345678`

**⚠️ Important**: Change these credentials in production!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Enterprise Point Cloud Platform.

---

**🎯 Ready to use immediately after following setup instructions!**