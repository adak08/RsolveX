# ResolveX - Community Complaint Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-darkgreen?logo=mongodb)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![Security Status](https://img.shields.io/badge/Security-ENHANCED-brightgreen)](#-security-features)

A modern, workspace-based complaint and issue resolution platform designed for communities, institutions, and organizations. Built with Node.js, Express, MongoDB, React, and Socket.IO.

---

## ✨ Recent Updates (June 2026)

### 🛡️ Security Enhancements
- **CSRF Protection**: Implemented robust CSRF protection using `csurf` middleware across all state-changing API endpoints. The client automatically fetches and attaches the `X-CSRF-Token` header for secure requests.
- **Secure File Uploads**: Enhanced file upload validation by enforcing strict whitelist MIME-type checks (`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`) and a strict 5MB file-size limit processed directly via memory buffers.
- **Hardened Middleware**: Refactored authentication and rate-limiting middleware (`auth.js`, `staffAuth.js`, `adminAuth.js`, `rateLimiter.js`) to enforce tighter role-based controls and prevent brute-force attacks.

### 📊 Advanced Analytics & Exports
- **Interactive Dashboard**: Upgraded `AnalyticsPage` to support multiple dynamic chart views (trend analysis, categories, priorities, and status distributions) using Area and Bar chart styles.
- **Data Exporting**: Introduced native export capabilities, allowing administrators to export data directly to CSV and PDF formats.

### 🏢 Workspace Isolation & Flow
- **Workspace Joining**: Citizens can now search and join workspaces using code validation directly from their `UserProfile`.
- **Intelligent Complaint Placement**: Integrated workspace selection and validation into the `RaiseComplaint` page.
- **Audit Logs Upgrade**: Enhanced the `AuditLogsPage` with color-coded action groups and expandable details for comprehensive auditability.

---

## 🎯 Overview

ResolveX is a comprehensive complaint management system that streamlines how organizations handle community grievances. It provides:

- **Multi-tenant Architecture**: Complete workspace isolation to support multiple independent organizations.
- **Role-Based Access Control (RBAC)**: Separate, secure workflows for Citizens, Staff, and Administrators.
- **Real-Time Updates**: Instant notifications and live messaging powered by Socket.IO.
- **Smart Assignment**: AI-powered complaint routing based on staff availability and area of expertise.
- **Comprehensive Analytics**: Interactive administrative dashboards visualizing trends, categories, and resolution metrics.
- **Audit Trail**: Complete, detailed logging of all critical system actions for compliance.

---

## 🏗️ Architecture

```
ResolveX/
├── BACKEND/                    # Express.js + MongoDB API
│   ├── src/
│   │   ├── app.js             # Express app setup, middleware, Socket.IO
│   │   ├── index.js           # Server entry point
│   │   ├── config/            # External service configs (Cloudinary, etc.)
│   │   ├── controllers/       # Business logic (auth, complaints, workspaces)
│   │   ├── middleware/        # Auth guards, CSRF, rate-limiters, validators
│   │   ├── models/            # Mongoose schemas & models
│   │   ├── routes/            # API endpoint groups
│   │   ├── utils/             # Helpers (AI classifier, audit logs, assignment engine)
│   │   └── scripts/           # Migration and seed scripts
│   └── package.json
│
└── client/                     # React + Vite frontend
    ├── src/
    │   ├── api/               # Axios client with interceptors
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # View pages (User, Staff, Admin)
    │   ├── context/           # Global state management (AuthContext)
    │   └── utils/             # Front-end utilities
    └── package.json
```

---

## 🚀 Key Features

### For Citizens
- **Complaint Management**: Create complaints with details, images, location metadata, and category suggestions.
- **Real-time Tracking**: Live status updates via Socket.IO.
- **Engagement**: Upvote public complaints, join community workspaces with unique invitation codes, and rank on participation leaderboards.

### For Staff
- **Task Management**: Dedicated workspace to view assigned complaints, update progress, and document resolutions.
- **Availability Controls**: Easy toggling of availability status (`available`, `busy`, `offline`, `on-leave`) and management of expertise categories.
- **Direct Interaction**: Real-time communication channels with administrators.

### For Administrators
- **Workspace Configuration**: Register workspaces, configure domain validation restrictions, and fine-tune auto-assignment rules.
- **Visual Analytics**: Interactive trend charts, category breakdowns, and physical heatmaps showing complaint distributions.
- **Compliance**: Access detailed audit logs with searchable and expandable rows showing actor IPs, user-agent details, and metadata changes.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) & **Express.js** (v5.x)
- **MongoDB** (v5.0+) & **Mongoose ODM** (v8.x)
- **Socket.IO** (v4.x) for bidirectional real-time communication
- **csurf** for CSRF token mitigation
- **Helmet** & **Express Rate Limit** for API security headers and brute-force prevention
- **Google Gemini API** (v1) for automated category and priority classification

### Frontend
- **React** (v18.x) & **Vite** (v4.x)
- **Axios** with automatic credential handling and CSRF interceptors
- **Tailwind CSS** (v3.x) & **Framer Motion** (v10.x) for responsive, fluid UI
- **Recharts** (v2.x) for rich data visualization
- **Lucide React** for modern iconography

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI connection string
- Cloudinary, Brevo, and Google Gemini API keys (Optional, fallback modes available)

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/adak08/RsolveX.git
   cd RsolveX
   ```

2. **Backend Setup**
   ```bash
   cd BACKEND
   npm install
   cp .env.example .env
   # Edit .env and supply your environment variables
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Customize VITE_API_URL and settings in .env if needed
   ```

---

## 🔧 Configuration

### Backend Environment Variables (`BACKEND/.env`)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resolvex
DB_NAME=resolvex_db

# Security & Secrets (Min 32 characters recommended)
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
CLIENT_URL=http://localhost:5173
FORCE_HTTPS=false

# Third-Party Integrations
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Environment Variables (`client/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=ResolveX
```

---

## 🚀 Running the Application

### Development Mode

Run the backend and frontend simultaneously in separate terminals:

**Terminal 1 (Backend)**:
```bash
cd BACKEND
npm run dev
```
*Backend server starts at `http://localhost:3000`*

**Terminal 2 (Frontend)**:
```bash
cd client
npm run dev
```
*Vite dev server starts at `http://localhost:5173`*

---

## 🔒 Security Architecture

ResolveX implements defensive coding practices to ensure user and platform safety:
1. **CSRF Protection**: Handled via secure HTTP-Only cookies utilizing strict validation flags (`sameSite: 'strict'`).
2. **Input Validation**: All incoming request bodies are checked and sanitized through schemas to prevent MongoDB query injection.
3. **MIME-Type & Payload Verification**: File uploads verify underlying magic bytes/mimetype and are rejected if they exceed 5MB.
4. **JWT Verification**: Strict JWT verification middleware manages authorization. Access tokens have short lifespans, while refresh tokens are verified using secure cookies.
5. **Rate Limiting**: Rate limits applied strictly on sensitive endpoints like login and OTP requests.

---

## 🧪 Testing

```bash
# To run backend unit tests
cd BACKEND
npm test

# To run frontend unit tests
cd client
npm test
```

---

## 📄 License & Credits

Distributed under the MIT License. Built with passion by the ResolveX team.
