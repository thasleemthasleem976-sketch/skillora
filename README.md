# 🎓 Skillora — Advanced Learning Management System (LMS)
### With Automated Exam Proctoring and High-Definition Video Streaming

**Skillora** is a modern full-stack EdTech platform engineered for online education, live video classrooms, coursework tracking, and secure proctored online examinations.

---

## 🚀 Key Highlights & Architectural Separation

1. **MongoDB Store**: Stores users, courses, lessons, questions, exam attempts, numerical results, and timestamped proctoring logs.
2. **Dedicated Video Streaming**: Video files are decoupled from MongoDB and handled via Cloudinary or high-performance local HTTP 206 Partial Content byte-range streaming (`/api/videos/stream/:id`), supporting smooth seek, buffer caching, volume, and playback speed control.
3. **Automated AI Proctoring (FaceAPI.js)**:
   - Facial presence monitoring ("Face detected", "Face not detected")
   - Multi-face alert detection ("Multiple faces detected in frame")
   - Window & tab blur tracking ("Warning: Please stay on the examination window")
   - Head movement & fullscreen exit detection
   - Real-time warning toasts and persistent event logging to MongoDB.
4. **Interactive WebRTC & Socket.io Live Classes**:
   - Live video & microphone streams
   - Screen sharing support
   - Live class room chat
   - In-class participant list and automated join/leave attendance tracking.
5. **Background Processing**:
   - BullMQ + Redis job queues with an automatic resilient in-memory fallback for asynchronous video processing and exam evaluation.
6. **No Certificates**: Built strictly as specified without certificate generation.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Liquid Glassmorphism UI, FaceAPI.js, Socket.io-client
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with Role-Based Access Control (`student`, `teacher`, `admin`)
- **Real-Time Communication**: Socket.io & WebRTC
- **Video Storage & Streaming**: Cloudinary & HTTP 206 Partial Content Streaming Engine
- **Background Tasks**: BullMQ + Redis (with resilient in-memory fallback)

---

## 👥 Demo User Credentials

The database is pre-seeded with rich sample courses, lessons, quizzes, assignments, live classes, exams, and demo users.
You can also use the **1-Click Demo Login** buttons on the login page or top navigation bar.

| Role | Email | Password |
|---|---|---|
| **Student** | `student@skillora.edu` | `Password@123` |
| **Teacher** | `teacher@skillora.edu` | `Password@123` |
| **Admin** | `admin@skillora.edu` | `Password@123` |

---

## 🏃 Running the Application

### Backend:
```bash
cd backend
npm install
npm run seed     # Seeds demo users, courses, videos, and exams
npm run dev      # Starts API & Socket.io server on http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev      # Starts Vite React dashboard
```

Open your browser at `http://localhost:5174/` or `http://localhost:5173/`.
