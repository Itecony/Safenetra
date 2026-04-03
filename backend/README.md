# Safe-N Core (Version 1 – Emergency MVP)

## 🚨 Overview

Safe-N is a real-time emergency response platform designed to provide immediate SOS activation, continuous location tracking, and centralized incident monitoring.

Version 1 establishes the core emergency pipeline:

- User triggers SOS
- Live GPS streaming begins
- Incident is generated and stored
- Command Center receives real-time updates
- Operator monitors and resolves incident

This release validates:

- Real-time WebSocket infrastructure  
- Secure authentication layer  
- Incident lifecycle stability  
- Scalable backend architecture  

---

## 🧱 System Architecture

Safe-N Version 1 consists of three major components:

### 1️⃣ Mobile App (Flutter)

- User registration & authentication  
- One-tap SOS trigger  
- Silent SOS mode  
- Delayed SOS activation (5–10 seconds)  
- Continuous GPS tracking (5–10 sec interval)  
- Offline fallback queue  
- Emergency contact linking  

---

### 2️⃣ Backend (Node.js + MongoDB)

- JWT authentication  
- Role-based access (User / Operator)  
- SOS orchestration engine  
- Incident ID generation  
- Incident lifecycle management (Active / Resolved)  
- WebSocket location ingestion  
- Real-time dashboard broadcasting  

---

### 3️⃣ Command Center (ReactJS)

- Operator authentication panel  
- Role-protected routes  
- Live incident feed  
- Real-time map visualization  
- Movement trail tracking  
- Incident control panel  
- Location history + timestamp logs  

---

## 🔁 Incident Lifecycle (Version 1)

1. User triggers SOS  
2. Backend generates incident ID  
3. Incident stored as **Active**  
4. Location tracking begins  
5. Dashboard receives live updates  
6. Operator monitors movement  
7. Operator marks incident as **Resolved**  
8. Tracking stops automatically  

---

## ⚙️ Tech Stack

### Mobile
- Flutter
- Secure local storage
- WebSocket client

### Backend
- Node.js (ES6 Modules)
- Express
- MongoDB
- WebSocket Server
- JWT Authentication

### Command Center
- ReactJS
- WebSocket client
- Map integration (Leaflet or Google Maps)

---

## 🔐 Authentication & Roles

Safe-N implements secure token-based authentication.

**Roles:**

- `User`
- `Operator`

Features:
- JWT session handling
- Token validation middleware
- Role-based route protection
- Secure WebSocket authorization

---

## 📡 Real-Time Infrastructure

- Dedicated WebSocket server
- Live location ingestion
- Timestamped coordinate storage
- Broadcast to dashboard
- Retry & fail-safe handling
- Incident state synchronization

---

## 📂 Project Structure (Monorepo)

```
safe-n-core/
│
├── mobile/              # Flutter app
├── backend/             # Node.js API + WebSocket server
├── command-center/      # React dashboard
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   └── roadmap.md
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🌍 Environment Variables

Create a `.env` file based on:

```
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
WS_PORT=
```

---

## 🚀 Local Development Setup

### Backend

```bash
cd backend
pnpm install
pnpm dev
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

### Command Center

```bash
cd command-center
pnpm install
pnpm dev
```

---

## ✅ Version 1 Scope (Delivered)

- ✔ User registration & login  
- ✔ SOS trigger system  
- ✔ Real-time location streaming  
- ✔ Incident creation & storage  
- ✔ Dashboard monitoring  
- ✔ Operator resolution  
- ✔ Live status synchronization  

---

## 🏗 Architectural Outcome

After Version 1, Safe-N provides:

- Stable WebSocket infrastructure  
- Secure authentication layer  
- Incident lifecycle model  
- Live geospatial visualization  
- Scalable backend foundation  

---

## 📈 Roadmap (Post-MVP)

- Push notifications  
- Multi-responder routing  
- Authority integration  
- AI-assisted incident classification  
- Analytics dashboard  
- Multi-region deployment  

---

## 🛡 Security Principles

- Token-based authentication  
- Role enforcement middleware  
- Secure WebSocket validation  
- Input validation & sanitization  
- Incident ownership checks  

---

## 📄 License

Proprietary — Safe-N Platform  
All rights reserved.
