# SkillSwap — Peer-to-Peer Skill Exchange Marketplace 🚀

**SkillSwap** is a production-level, full-stack MERN application that replaces money with knowledge. It allows users to trade their expertise for another person's skills using a secure, gamified, and real-time platform.

![SkillSwap Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop)

---

## 🌟 Core Vision
The platform is designed to build a self-sustaining community of learners and mentors. Whether you're a developer wanting to learn design or a cook wanting to learn coding, SkillSwap facilitates that connection through smart matching and real-time communication.

---

## 🚀 Key Features

### 1. Smart Compatibility Matching 🧠
- Uses a multi-factor compatibility algorithm that analyzes overlapping skills (what you offer vs. what others want).
- Prioritizes matches based on reciprocal skill exchange and availability.
- Discover people who perfectly complement your learning goals with a score-based ranking.

### 2. Real-Time Communication 💬
- **Sub-system**: Powered by Socket.IO.
- **Features**: Instant messaging, typing indicators, online/offline status, and message unread counts.
- **Notifications**: In-app real-time alerts for session requests, approvals, and earned badges.

### 3. Comprehensive Session Management 📅
- Users can request learning sessions with their matches.
- Full lifecycle: Request -> Approval -> Completion -> Review.
- Integrated calendar slots and note-taking for every session.

### 4. Advanced Gamification & Reputation 🏆
- **XP System**: Earn experience points for every session completed and review received.
- **Badges**: Unlock milestone badges (First Steps, Skill Sharer, Mentor, Master Trader) as you progress.
- **Reputation**: A calculated score based on peer reviews to ensure platform trust and safety.
- **Leaderboard**: Compete globally on the XP and Reputation leaderboards.

### 5. Professional Admin Panel 🛡️
- **Management**: Full control over user accounts (ban/unban/verify).
- **Analytics**: High-level platform statistics (total users, active sessions, system reports).
- **Reports**: Handle user-reported content to maintain community standards.

---

## 🛠️ Technical Architecture

### **Frontend**
- **Library**: React 18+ with Vite for ultra-fast development.
- **Styling**: Tailwind CSS for a modern, responsive Glassmorphism design.
- **State Management**: React Context API for Auth, Notifications, and Socket state.
- **Animations**: Framer Motion for smooth UI transitions and micro-interactions.

### **Backend**
- **Runtime**: Node.js with Express.
- **Database**: MongoDB with Mongoose for robust data modeling.
- **Real-Time**: Socket.IO for bidirectional event-based communication.
- **Security**: JWT-based authentication with Access & Refresh token rotation.

### **Media & Storage**
- **Cloudinary**: Integrated for user avatars and portfolio images.
- **Fallback**: Built-in local file system storage if Cloudinary is not configured.

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher.
- **Database**: A running local MongoDB community edition or a MongoDB Atlas URI.
- **Tools**: `npm` or `yarn`.

### Step-by-Step Local Setup

1. **Clone the Project**:
   ```bash
   git clone https://github.com/ayushghimire2026/SkillSwap.git
   cd SkillSwap
   ```

2. **Backend Configuration**:
   ```bash
   cd server
   npm install
   # Configure your .env file with appropriate MONGO_URI and JWT_SECRET
   npm run dev
   ```
   *The backend will listen on port **5001**.*

3. **Frontend Configuration**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *The frontend will start on port **5175** and automatically proxy API calls to the backend.*

---

## 📂 Project Structure

```bash
SkillSwap/
├── client/                 # React Frontend source
│   ├── src/
│   │   ├── components/     # Visual components (Navbar, Toast)
│   │   ├── context/        # State management (Auth, Socket)
│   │   ├── pages/          # Individual page views (Dashboard, Admin)
│   │   └── services/       # API interaction layer
├── server/                 # Node.js Express Backend source
│   ├── config/             # Database and Cloudinary config
│   ├── controllers/        # Core business logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   └── sockets/           # Socket.IO event handlers
└── API_DOCS.md             # Detailed endpoint documentation
```

---

## ✍️ Credits & Ownership

This project was architected, developed, and personalized by **Ayush Ghimire**. 

Ayush Ghimire is the sole owner of this project and has overseen its entire creation, from its complex real-time architecture to its professional aesthetic design.

## 📄 License

MIT © 2026 **Ayush Ghimire**
