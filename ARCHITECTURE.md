# Sentinel AI Assessment Platform - System Architecture & Design

## 1. Feature Architecture

### Core Modules
1.  **Identity & Access Management (IAM)**
    *   **Roles:** Super Admin, College Admin, Company HR, Faculty, Candidate.
    *   **Auth:** JWT-based stateless authentication (Session management for exams).
    *   **RBAC:** Granular permission sets for accessing Exam Creation vs. Analytics.

2.  **Assessment Engine**
    *   **Question Bank:** Polymorphic storage (MCQ, Coring, Subjective).
    *   **Test Generator:** Randomizer algorithm based on difficulty distribution.
    *   **Code Sandbox:** Isolated execution environment (Dockerized containers in real production, WebWorkers for frontend simulation).

3.  **Security & Proctoring (The "Sentinel" Core)**
    *   **Client-Side Agents:**
        *   `FocusGuard`: Tracking focus, blur, tab visibility.
        *   `VisionGuard`: WebRTC stream analysis (Face detection, gaze tracking).
        *   `AudioGuard`: Decibel level monitoring.
    *   **Server-Side Validation:**
        *   IP Rate Limiting.
        *   Device Fingerprinting (User-Agent + Canvas Fingerprint).

4.  **Analytics & Reporting**
    *   **Real-time Dashboard:** WebSocket connections for live proctoring feeds.
    *   **Post-Exam Analytics:** Percentile calculation, Question-wise difficulty analysis.

5.  **Internship Closure & AI Feedback**
    *   **Feedback Engine:** Multi-step capture of experience, skills, and mentorship.
    *   **AI Analyzer:** automated sentiment analysis and summary generation.
    *   **Management Panel:** Admin dashboard for reviewing and downloading PDF performance reports.

## 2. System Flow

### A. Candidate Journey
1.  **Invitation:** Email with unique, time-bound link (Signed URL).
2.  **System Check:** Bandwidth, Camera, Mic, Browser compatibility check.
3.  **Auth/Verification:** Face registration + ID Card snap.
4.  **Exam Environment:** Full-screen lockdown mode.
    *   *Heartbeat:* Sends status every 30s to server.
    *   *Incident:* Pushes immediate alert to Proctor Dashboard.
5.  **Submission:** Auto-submit on timer expiry or manual finish.
6.  **Closure:** Post-internship feedback form, self-evaluation, and AI-generated final summary.
7.  **Feedback/Score:** Instant score (optional) or "Under Review" status.

### B. Recruiter/College Flow
1.  **Drive Creation:** Define roles, salary, and rounds (e.g., Aptitude -> Coding -> Interview).
2.  **Configuration:** Select Question Sets, set Proctoring Strictness (High/Med/Low).
3.  **Invite:** Bulk upload candidates (CSV).
4.  **Monitor:** Live "Cockpit" view of all active candidates with Red/Yellow/Green status.
5.  **Shortlist:** Filter by Score > X AND CheatScore < Y.

## 3. Security Design (Defense in Depth)

| Layer | Mechanisms |
| :--- | :--- |
| **Browser (Frontend)** | `requestFullscreen`, `visibilitychange` API, Disable Context Menu, Clipboard Read/Write blocking. |
| **Network** | SSL/TLS, Signed Cookies, API Rate Limiting, CORS restriction to trust domains. |
| **Application** | JWT expiry, irregular generic questions (watermarking), Question shuffling. |
| **AI/Proctoring** | MediaPipe FaceMesh (Head pose estimation), Audio Activity Detection (VAD). |
| **Infrastructure** | DDOS Protection (Cloudflare), Encrypted Data at Rest (RDS/Firebase). |

## 4. Business Value & Scaling

*   **USP:** "Zero-Compromise Integrity". The Cheat Score is the primary currency of trust.
*   **Scalability:** Serverless functions (Lambdas) for code execution to handle burst traffic during campus drives.
*   **Monetization:** Tiered SaaS (Starter, Professional, Enterprise) based on "Test Attempts" and "Storage retention".

## 5. Technology Stack
*   **Frontend:** React (Vite) + TypeScript + TailwindCSS + Radix UI (Headless accessible components).
*   **State Management:** React Context + React Query (for server state).
*   **Video Processing:** Client-side TensorFlow.js / MediaPipe (to reduce server bandwidth costs).
*   **Charts:** Recharts for analytics.
