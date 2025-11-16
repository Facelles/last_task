# Meeting Booking System

A modern, full-stack meeting room booking application built with Next.js, Express.js, and Prisma ORM. Features advanced booking management with race condition protection, soft-delete functionality, and admin capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure user registration and login with JWT tokens
- **Room Management**: Create, view, and manage meeting rooms
- **Booking System**: Reserve rooms with time slot management
- **Booking Cancellation**: Cancel future bookings with soft-delete functionality
- **Admin Dashboard**: Advanced administrative controls

### Advanced Features
- **Race Condition Protection**: Transaction-based booking with FOR UPDATE locking
- **Unique Constraints**: Prevents double-booking of rooms using database constraints
- **Soft Delete**: Bookings are marked as deleted but preserved in database
- **Admin Controls**: Room deletion with cascade handling, user promotion
- **Role-Based Access**: User and Admin roles with different permissions

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 6.18.0
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker and Docker Compose (optional, for containerized setup)

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Facelles/last_task.git
cd meeting-booking
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/meeting_booking"
JWT_SECRET="your_jwt_secret_key"
PORT=5050
NODE_ENV=development
EOF

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file (optional, uses default API URL)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:5050/api"
EOF

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🐳 Docker Setup

```bash
cd backend

# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate dev
```

## 📁 Project Structure

```
meeting-booking/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # Prisma models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # API route handlers
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── bookings/    # Booking management
│   │   │   ├── rooms/       # Room management
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── layout.tsx   # Root layout
│   │   ├── hook/            # Custom React hooks
│   │   └── services/        # API service layer
│   └── package.json
└── README.md
```

## 🔐 Authentication

### User Roles
- **User**: Can create bookings, cancel own bookings, view own bookings
- **Admin**: Full access including room management and user promotion

### First User Benefits
The first user to register automatically becomes an admin.

### Login Credentials (Example)
```
Username: admin
Email: admin@test.com
Password: password123
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/promote` - Promote user to admin

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room (authenticated)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking (soft-delete)
- `POST /api/bookings/check-availability` - Check room availability

## 🔒 Race Condition Protection

The booking system uses transaction-based locking to prevent race conditions:

```typescript
// Bookings are created within a transaction with FOR UPDATE lock
// This ensures only one booking can be created for the same time slot
SELECT ... FROM bookings ... WHERE room_id = ? FOR UPDATE;
```

## 💾 Database Schema Highlights

### Soft Delete Pattern
```prisma
model Booking {
  // ...
  deletedAt DateTime?  // Null = active, Set = soft-deleted
}
```

### Unique Constraint
```prisma
@@unique([userId, roomId, startTime, endTime])
// Prevents duplicate bookings for same user, room, and time
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm run test
```

### Manual API Testing
```bash
# Login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"password123"}'

# Create booking
curl -X POST http://localhost:5050/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id":1,"start_time":"2025-11-20T10:00:00Z","end_time":"2025-11-20T11:00:00Z"}'
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend

# Build
npm run build

# Set environment variables on production server
export DATABASE_URL="your_production_db_url"
export JWT_SECRET="your_production_secret"
export NODE_ENV="production"

# Start
npm run start
```

### Frontend Deployment
```bash
cd frontend

# Build
npm run build

# Start
npm run start
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_secret_key
PORT=5050
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

## 🐛 Troubleshooting

### "Cannot find module 'prisma'"
```bash
npm install
npx prisma generate
```

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL environment variable
- Verify database exists and credentials are correct

### Port already in use
```bash
# Change PORT in backend .env file
# Or kill process using port:
lsof -ti:5050 | xargs kill -9
```

## 📚 Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created by Facelles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ✨ Future Enhancements

- [ ] Email notifications for booking confirmations
- [ ] Calendar view for bookings
- [ ] Room capacity management
- [ ] Meeting participants management
- [ ] Booking reminders
- [ ] Export bookings to calendar (iCal)
- [ ] Real-time notifications with WebSockets
- [ ] Advanced filtering and search
