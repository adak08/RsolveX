# ResolveX — Community Complaint Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-darkgreen?logo=mongodb)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> A modern, workspace-based complaint and issue resolution platform for communities, institutions, and organisations. Built with Node.js, Express, MongoDB, React, and Socket.IO.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Complaint Lifecycle](#complaint-lifecycle)
- [AI Integration](#ai-integration)
- [Real-time Features](#real-time-features)
- [Security Implementation](#security-implementation)
- [Deployment Guide](#deployment-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**ResolveX** is a production-ready, multi-tenant complaint management system that streamlines how organisations handle community grievances. Citizens can submit complaints with multimedia attachments, staff can efficiently resolve issues, and administrators get full visibility through dashboards, analytics, audit logs, and workspace controls.

### Key Differentiators

- 🔐 **Complete Workspace Isolation** — each organisation gets its own private, code-protected workspace
- 🤖 **AI-Powered Classification** — automatically categorises and prioritises "other" complaints using Google Gemini
- 📊 **Rich Analytics** — interactive charts, heatmaps, staff performance metrics, and exportable reports (CSV/PDF)
- 💬 **Real-time Communication** — live chat between staff and admins, plus instant notifications
- 🏆 **Gamification** — community voting and leaderboards to encourage engagement
- 📝 **Comprehensive Audit Trail** — every critical action is logged and searchable

---

## Key Features

### For Citizens (Users)

- **Complaint submission** — title, description, category (with "other" option), location picker, and up to 5 images
- **Real-time tracking** — status updates appear instantly via WebSockets
- **Community voting** — upvote complaints to prioritise issues
- **Workspace join** — use a unique code to become part of an organisation
- **Rating & feedback** — rate resolved complaints and see your rank on the leaderboard

### For Staff

- **Assigned complaints** — dedicated dashboard listing only your tasks
- **Status management** — update progress (`pending → in-progress → resolved`)
- **Work notes** — add internal comments visible to admins
- **Performance metrics** — view your resolution rate, average time, and leaderboard position

### For Administrators

- **Full complaint CRUD** — update any complaint, assign/unassign staff, change priority and category
- **Bulk actions** — assign multiple complaints to a staff member at once
- **Workspace configuration** — manage organisation details, domain restrictions, and auto-assignment rules
- **Analytics & reporting** — trends, category breakdowns, staff performance, and exportable reports
- **Audit logs** — search and filter all actions with rich metadata

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI framework |
| | Vite | 4.x | Build tool & dev server |
| | Tailwind CSS | 3.x | Styling (dark mode ready) |
| | Framer Motion | 10.x | Animations & transitions |
| | Recharts | 2.x | Chart visualisation |
| | Axios | 1.x | HTTP client with interceptors |
| **Backend** | Node.js | 18+ | JavaScript runtime |
| | Express | 5.x | Web framework |
| | Mongoose | 8.x | MongoDB ODM |
| | Socket.IO | 4.x | WebSockets for real-time |
| | JWT | 9.x | Token-based authentication |
| | Bcrypt | 5.x | Password hashing |
| | csurf | 1.x | CSRF protection |
| | Helmet | 7.x | Security headers |
| **Database** | MongoDB | 5.0+ | NoSQL database (Atlas/local) |
| **External APIs** | Cloudinary | — | Image hosting |
| | Google Gemini | — | AI classification |
| | Brevo (Sendinblue) | — | Email/SMS delivery |

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   User   │  │  Staff   │  │  Admin   │  │  Public  │        │
│  │  Pages   │  │  Pages   │  │  Pages   │  │ Landing  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │              │              │              │              │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐        │
│  │             Axios Interceptor                         │        │
│  │        (Auth + CSRF + Error Handling)                 │        │
│  └──────────────────────────┬────────────────────────────┘        │
└─────────────────────────────┼───────────────────────────────────┘
                              │  HTTPS / WebSocket
┌─────────────────────────────┼───────────────────────────────────┐
│              BACKEND (Node.js + Express)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Helmet → CORS → RateLimit → CSRF → Auth → WS            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Auth    │  │Complaint │  │  Admin   │  │Analytics │        │
│  │Controllers│  │Controllers│  │Controllers│  │Controllers│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │              │              │              │              │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐        │
│  │                   Service Layer                        │        │
│  │       (AI Classifier / Assignment Engine / Audit)      │        │
│  └──────────────────────────┬────────────────────────────┘        │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                   DATABASE (MongoDB)                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Users  │ │ Staff  │ │ Admins │ │Complaints│ │ Workspace │  │
│  └────────┘ └────────┘ └────────┘ └──────────┘ └───────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  ┌────────┐      │
│  │AuditLog│ │Ratings │ │ChatMsg │ │ Notifs │  │Leaderbd│      │
│  └────────┘ └────────┘ └────────┘ └────────┘  └────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure — Backend

```
BACKEND/
├── src/
│   ├── app.js              # Express setup, middleware, Socket.IO
│   ├── index.js            # Server entry point
│   ├── config/             # External service configs (Cloudinary, etc.)
│   ├── controllers/        # Business logic for each entity
│   ├── middleware/         # Auth guards, CSRF, rate-limiters
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoint groups
│   ├── utils/              # Helpers (AI, audit, assignment engine)
│   └── db/                 # MongoDB connection
├── .env.example
├── package.json
└── README.md
```

### Folder Structure — Frontend

```
client/
├── src/
│   ├── api/                # Axios client (interceptors, CSRF)
│   ├── components/
│   │   ├── auth/           # Auth modal & forms
│   │   ├── common/         # Buttons, badges, modals, loaders
│   │   ├── admin/          # Admin-specific components
│   │   ├── staff/          # Staff-specific components
│   │   └── user/           # User-specific components
│   ├── context/            # React context (Auth, Theme)
│   ├── layouts/            # Layout wrappers (AdminLayout, StaffLayout)
│   ├── pages/
│   │   ├── admin/          # Admin dashboard, issues, staff, etc.
│   │   ├── staff/          # Staff dashboard, issues, profile
│   │   ├── user/           # User home, complaints, raise, profile
│   │   └── public/         # Landing page
│   ├── utils/              # Helpers (timeAgo, etc.)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── vite.config.js
```

---

## Data Models

### Core Entities (Mongoose Schemas)

| Model | Description | Key Fields |
|-------|-------------|------------|
| **Workspace** | Organisation container | `name`, `workspaceCode`, `adminId`, `settings` |
| **User** | Citizen | `name`, `email`, `password`, `phone`, `workspaceId` |
| **Staff** | Support staff | `name`, `email`, `staffId`, `department`, `issueCategories`, `availabilityStatus` |
| **Admin** | Workspace admin | `name`, `email`, `permissions`, `workspaceId` |
| **UserComplaint** | Main complaint | `title`, `description`, `category`, `status`, `priority`, `assignedTo`, `user`, `workspaceId` |
| **AdminComplaint** | Internal admin complaint | `title`, `type`, `raisedBy`, `againstStaff` |
| **Rating** | User rating for resolved complaints | `complaintId`, `userId`, `score`, `comment` |
| **ChatMessage** | Real-time messages | `conversationId`, `senderId`, `receiverId`, `message` |
| **Notification** | Push notifications | `userId`, `type`, `message`, `isRead` |
| **Leaderboard** | Gamification points | `workspaceId`, `userId`, `points`, `complaintsSubmitted` |
| **AuditLog** | Activity trail | `workspaceId`, `actorId`, `action`, `metadata` |
| **OTP** | One-time passwords | `identifier`, `otp`, `purpose`, `expiresAt` |

### Key Relationships

```
Workspace (1) ───┬── (∞) User
                 ├── (∞) Staff
                 ├── (∞) Admin
                 └── (∞) UserComplaint

UserComplaint ───┬── (1) User  (raisedBy)
                 ├── (1) Staff (assignedTo)
                 └── (∞) Rating

Staff ───────────┬── (∞) UserComplaint (assignedTo)
                 └── (1) Department
```

---

## Installation

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas URI)
- Cloudinary account (image uploads)
- Brevo (Sendinblue) or Twilio account (OTP delivery)
- Google Gemini API key (AI classification)

### Step-by-Step

**1. Clone the repository**

```bash
git clone https://github.com/your-username/resolvex.git
cd resolvex
```

**2. Set up the backend**

```bash
cd BACKEND
npm install
cp .env.example .env
# Edit .env with your credentials
```

**3. Set up the frontend**

```bash
cd ../client
npm install
cp .env.example .env
# Edit VITE_API_URL if needed (default: http://localhost:3000)
```

---

## Environment Variables

### Backend (`BACKEND/.env`)

```env
# Server
PORT=3000
NODE_ENV=development
FORCE_HTTPS=false

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resolvex
DB_NAME=resolvex_db

# JWT Secrets (min 32 chars)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Brevo (Sendinblue) for emails
BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=noreply@yourdomain.com

# Twilio for SMS (optional)
TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_token
TWILIO_PHONE=+1234567890

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=ResolveX
```

---

## Running the Application

### Development Mode

**Terminal 1 — Backend**

```bash
cd BACKEND
npm run dev   # runs on port 3000 (or PORT env)
```

**Terminal 2 — Frontend**

```bash
cd client
npm run dev   # runs on port 5173 (Vite default)
```

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend (PM2 recommended)
cd ../BACKEND
pm2 start npm --name "resolvex" -- start
```

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspace/register` | Admin creates a workspace |
| POST | `/api/users/signup` | User signup (with OTP) |
| POST | `/api/users/login` | User login |
| POST | `/api/staff/register` | Staff signup (with OTP) |
| POST | `/api/staff/login` | Staff login |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/otp/request` | Request OTP |
| POST | `/api/otp/verify` | Verify OTP |

### Authenticated User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/logout` | Logout |
| POST | `/api/users/refresh-token` | Refresh access token |
| GET | `/api/user_issues` | List all complaints (workspace-scoped) |
| POST | `/api/user_issues` | Create a complaint |
| GET | `/api/user_issues/my-issues` | List user's complaints |
| GET | `/api/user_issues/locations` | Map pin data for complaints |
| GET | `/api/user_issues/:id` | Get complaint details |
| PUT | `/api/user_issues/:id/vote` | Vote on a complaint |
| POST | `/api/user_issues/:id/rate` | Rate a resolved complaint |
| GET | `/api/user_issues/:id/rating` | Get rating for a complaint |
| POST | `/api/upload` | Upload images (to Cloudinary/memory) |
| GET | `/api/leaderboard` | Workspace-scoped leaderboard |
| GET | `/api/leaderboard/me` | Logged-in user's rank and stats |
| GET | `/api/notifications/:userId` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |

### Staff Endpoints (require `staffAuth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/issues` | List assigned complaints |
| GET | `/api/staff/issues/stats` | Staff statistics |
| PUT | `/api/staff/issues/:id` | Update complaint status |
| GET | `/api/staff/issues/:id/chat` | Get chat messages |
| POST | `/api/staff/issues/:id/chat` | Send chat message |
| GET | `/api/staff/issues/admins/list` | Get admin info for workspace |

### Admin Endpoints (require `adminAuth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/issues` | List all complaints (with filters) |
| GET | `/api/admin/issues/staff` | List staff members |
| GET | `/api/admin/issues/:id` | Get complaint details |
| PUT | `/api/admin/issues/:id` | Update complaint |
| POST | `/api/admin/issues/bulk-assign` | Bulk assign complaints |
| GET | `/api/admin/issues/:id/chat` | Get chat messages |
| POST | `/api/admin/issues/:id/chat` | Send chat message |
| GET | `/api/admin/analytics` | Get analytics data |
| GET | `/api/admin/analytics/heatmap` | Get heatmap data |
| GET | `/api/admin/analytics/export` | Export CSV/PDF |
| GET | `/api/admin/analytics/staff-performance` | Staff performance metrics |
| GET | `/api/audit` | Full audit log for the workspace |
| GET | `/api/audit/:entityId` | Audit logs for a specific entity |
| GET | `/api/ratings/staff/:staffId` | View staff ratings |

### Workspace & Admin Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/workspace/join/user` | User joins workspace | User |
| POST | `/api/workspace/join/staff` | Staff joins workspace | Staff |
| GET | `/api/workspace/info` | Workspace info | Admin |
| PUT | `/api/workspace/settings` | Update settings | Admin |
| GET | `/api/workspace/members` | List members | Admin |
| DELETE | `/api/workspace/member/:memberType/:id` | Remove member | Admin |

### Real-time Events (Socket.IO)

| Event (Client → Server) | Description |
|-------------------------|-------------|
| `join` | Join personal notification room (`userId`) |
| `join_workspace` | Join workspace broadcast room (`workspaceId`) |

| Event (Server → Client) | Description |
|-------------------------|-------------|
| `new_message` | New chat message received |
| `notification` | Push notification |
| `message_edited` | Message was edited |
| `message_deleted` | Message was deleted |

---

## Authentication Flow

### Standard Login

1. Client sends `email` and `password` to `/api/users/login` (or `/staff/login`, `/admin/login`).
2. Server validates credentials and generates an **access token** (15 min expiry) and a **refresh token** (7 days) via JWT.
3. Access token is returned in the JSON response; refresh token is set as an `HttpOnly` cookie.
4. All subsequent API requests include the access token in the `Authorization: Bearer <token>` header.
5. When the access token expires, the client calls `/api/users/refresh-token` (sends refresh cookie) to obtain a new access token.

### OTP Login Flow

1. Client sends `identifier` (email/phone) and `purpose` to `/api/otp/request`.
2. Server generates a 6-digit OTP, hashes it, stores it in the OTP collection with a 10-minute expiry, and delivers it via email/SMS.
3. Client sends `identifier` and `otp` to `/api/otp/verify`.
4. Server verifies the OTP (including attempts limit) and marks it as verified.
5. The client then calls the relevant login endpoint to receive tokens.

---

## Complaint Lifecycle

```
[User Submits] → Pending → [Admin Reviews]
                    ↓
             [In-Progress] ← Staff Assigned
                    ↓
             [Resolved] → User Rates
                    ↓
             [Rejected] (with reason)
```

| Status | Description |
|--------|-------------|
| **Pending** | New complaint, awaiting admin action |
| **In-Progress** | Assigned to a staff member and being worked on |
| **Resolved** | Staff has resolved the issue |
| **Rejected** | Admin declined the complaint (reason required) |

### Status Transition Rules

- `Pending → In-Progress`: Admin assigns a staff member (or auto-assignment runs)
- `Pending → Rejected`: Admin rejects with a mandatory reason
- `In-Progress → Resolved`: Staff or Admin marks as resolved
- `In-Progress → Rejected`: Admin rejects
- `Resolved` is a final state — can be rated but not reopened

---

## AI Integration

### Complaint Classification

When a user selects **"other"** as the category, the backend sends the complaint to Google Gemini for classification.

**Input to AI:**

```json
{
  "title": "Fire broke out near block C",
  "description": "Large fire in the parking lot, smoke visible",
  "customOtherLabel": "fire"
}
```

**AI Response:**

```json
{
  "category": "safety",
  "priority": "critical",
  "reasoning": "Fire incident requires immediate attention",
  "aiClassified": true
}
```

The result is stored in the `aiClassification` field and surfaced to admins in the dashboard.

### Smart Assignment

When `autoAssign` is enabled in workspace settings, the `getSmartAssignee` engine considers:

- **Staff availability** — `availabilityStatus === "available"`
- **Staff expertise** — `issueCategories` matches the complaint category
- **Current workload** — respects the `maxActiveComplaints` limit

---

## Real-time Features

### Chat Between Staff and Admin

- Each complaint has a dedicated chat thread.
- Messages are stored in `ChatMessage` with a `conversationId` derived from `[userId1, userId2, complaintId]`.
- Socket.IO emits `new_message` to the recipient's room in real time.

### Notifications

Notifications are generated for:

- Complaint status changes
- New assignment
- New chat message
- Rejection reason

Notifications are persisted in the `Notification` collection and pushed instantly via Socket.IO to the user's personal room.

---

## Security Implementation

### CSRF Protection

- Enabled globally via `csurf` middleware.
- A `csrf-token` cookie is set on initial page load.
- Clients must include the token in the `X-CSRF-Token` header for all non-GET requests.

### Helmet.js

Sets secure HTTP headers including HSTS, `X-Frame-Options`, and more.

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/otp/*` | 5 requests | 15 min |
| `/api/users/login` | 10 requests | 15 min |
| `POST /api/user_issues` | 5 requests | 1 hour |
| General | 100 requests | 15 min |

### Input Validation

- All request payloads are validated using custom validators.
- File uploads are restricted to image MIME types with a max size of **5 MB**.

### Password Hashing

Passwords are hashed with **bcrypt** (salt rounds = 10).

### JWT Best Practices

- Access tokens are short-lived (15 min).
- Refresh tokens are stored in `HttpOnly` cookies, inaccessible via JavaScript.

---

## Deployment Guide

### With PM2

```bash
# Build frontend
cd client
npm run build
cp -r dist ../BACKEND/public

# Start backend
cd ../BACKEND
pm2 start npm --name "resolvex" -- start
pm2 save
pm2 startup
```

### With Docker

**Backend `Dockerfile`:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

**`docker-compose.yml`:**

```yaml
version: '3.8'
services:
  backend:
    build: ./BACKEND
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/resolvex
    depends_on:
      - mongodb
  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

> In production, ensure `NODE_ENV=production`, `FORCE_HTTPS=true`, and all secrets are set securely.

---

## Testing

```bash
# Backend tests
cd BACKEND
npm test

# Frontend tests
cd client
npm test

# End-to-end tests
npm run test:e2e
```

---

## Troubleshooting

| Issue | Likely Cause | Solution |
|-------|-------------|---------|
| CORS errors | Mismatched `CLIENT_URL` | Update `.env` and restart the server |
| Socket.IO connection fails | Transport or proxy misconfiguration | Check `transports: ["websocket", "polling"]` and CORS settings |
| OTP not received | Missing API keys or incorrect sender credentials | Verify Brevo/Twilio keys and phone/email formats |
| Image upload fails | Cloudinary credentials or folder permissions | Check `CLOUDINARY_*` variables |
| CSRF token invalid | Missing or stale cookie | Refresh the page to get a new token |
| Workspace not found | `workspaceResolver` middleware missing | Ensure middleware is applied to routes that need it |
| Chat messages not loading | Incorrect `conversationId` generation | Verify `senderId` and `receiverId` are valid ObjectIds |

### Enable Debug Logging

```bash
# Backend
DEBUG=express:* node index.js
DEBUG=socket.io:* node index.js
```

For frontend debugging, open the browser console.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with a conventional commit message:
   ```
   feat(scope): description
   ```
4. Push and open a Pull Request.

### Code Style

- Use ES modules (`import`/`export`)
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Write JSDoc comments for all functions
- Use `async`/`await` for asynchronous code

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Support & Contact

- **Email:** pprincekumar598@gamil.com