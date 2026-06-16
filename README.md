# ResolveX

ResolveX is a workspace-based complaint and issue resolution platform for communities, institutions, and organizations. It supports three roles - citizens, staff, and administrators - with separate dashboards, secure authentication, real-time notifications, complaint tracking, chat, analytics, and workspace isolation.

## Overview

ResolveX is built as two separate applications:

- `BACKEND/` - an Express + MongoDB API with Socket.IO, OTP login, workspace management, complaint workflows, analytics, audit logs, notifications, and file upload support.
- `client/` - a React + Vite frontend with role-based routing, animated dashboards, dark/light theme support, and real-time UI updates.

The application is designed for environments such as:

- Colleges and universities
- Municipalities
- Housing societies
- RWAs and similar organizations
- Other private workspaces

## Key Features

### Citizen Experience

- Sign up or sign in using password or OTP
- Join a workspace using a workspace code
- Raise complaints with category, priority, description, attachments, and location pinning
- Browse all complaints in the workspace
- Vote on complaints to increase visibility
- Track personal complaints and resolution progress
- View personal ranking on the leaderboard
- Receive notifications and use real-time chat where enabled

### Staff Experience

- View assigned complaints
- Update complaint status
- Search and filter assigned work
- Chat with other workspace participants
- View performance stats, rankings, and profile details
- Receive notifications for assignments and updates

### Admin Experience

- Create or manage a workspace
- Register or manage staff and users
- View complaint dashboards and analytics
- Review audit logs
- Manage workspace settings
- Access analytics, heatmaps, exports, and staff performance insights

### Platform Capabilities

- Workspace-scoped data isolation
- JWT-based authentication
- OTP flows for user, staff, and admin login/signup
- Socket.IO-powered real-time notifications and chat
- AI-assisted complaint classification
- Media upload support
- Complaint ratings and leaderboard tracking

## Tech Stack

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JWT authentication
- CORS, Helmet, cookie-parser, rate limiting
- Multer for uploads
- Cloudinary for media handling
- Brevo for email delivery
- Twilio for SMS fallback
- Gemini-based AI classification

### Frontend

- React 18
- Vite
- React Router v6
- Framer Motion
- Tailwind CSS
- Lucide React icons
- Recharts
- Socket.IO client

## Project Structure

```text
RsolveX/
├── BACKEND/
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   └── utils/
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database URI
- External service credentials for email, SMS, and AI features if you use those integrations

## Environment Variables

Create a `.env` file in `BACKEND/` with the values used by the server:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development

BREVO_API_KEY=your_brevo_api_key
GEMINI_API_KEY=your_gemini_api_key
TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number
```

Optional frontend environment variable in `client/`:

```env
VITE_API_URL=http://localhost:3000
```

If `VITE_API_URL` is not set, the client defaults to `http://localhost:3000`.

## Installation

### Backend

```bash
cd BACKEND
npm install
```

### Frontend

```bash
cd client
npm install
```

## Running Locally

Start the backend first, then the frontend.

### Backend

```bash
cd BACKEND
npm run dev
```

This starts the API on the configured `PORT` value, or `3000` by default. Socket.IO runs on the same server and port.

### Frontend

```bash
cd client
npm run dev
```

The Vite app typically runs on `http://localhost:5173`.

## Production Builds

### Backend

```bash
cd BACKEND
npm start
```

### Frontend

```bash
cd client
npm run build
npm run preview
```

## Backend Scripts

Available scripts in `BACKEND/package.json`:

- `npm start` - run the production server
- `npm run dev` - run the server with nodemon
- `npm run migrate` - run the workspace migration script

## Frontend Scripts

Available scripts in `client/package.json`:

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Main API Areas

The backend exposes these main route groups:

- `/api/users`
- `/api/staff`
- `/api/admin`
- `/api/otp`
- `/api/workspace`
- `/api/user_issues`
- `/api/admin/issues`
- `/api/staff/issues`
- `/api/notifications`
- `/api/chat`
- `/api/admin/analytics`
- `/api/leaderboard`
- `/api/ratings`
- `/api/audit`
- `/api/upload`

Useful health and debug endpoints:

- `/health`
- `/api/debug/routes`

## Frontend Areas

The UI is organized into three major role-based experiences:

- Public landing page with feature highlights and authentication entry points
- User area for complaint creation, browsing, leaderboard, and profile management
- Staff area for assigned issues, chat, and profile management
- Admin area for dashboards, staff/user management, analytics, audit logs, and settings

## Real-Time Behavior

ResolveX uses Socket.IO for real-time behavior across the platform.

- Authenticated clients connect to the same server as the API
- Notifications are pushed in real time
- Workspace-level room isolation keeps data scoped to the correct organization
- Chat updates can be reflected without full page refreshes

## Notes

- The backend uses CORS allow-lists and expects the frontend origin to be configured correctly.
- File upload errors are capped by a server-side size limit and return a clear `413` response.
- If you change the frontend URL, update `CLIENT_URL` and `VITE_API_URL` accordingly.

## Troubleshooting

- If login fails, confirm the JWT secrets and MongoDB connection are correct.
- If the frontend cannot reach the API, verify `VITE_API_URL` and the backend port.
- If real-time updates do not arrive, confirm Socket.IO is running on the backend and the client is connected with a valid token.
- If emails or SMS do not send, verify the Brevo and Twilio environment variables.

## License

No explicit license is defined in the repository.