# SkillSwap — Peer-to-Peer Skill Exchange Marketplace

SkillSwap is a full-stack MERN application where users trade skills instead of money. Built with a modern startup-style aesthetic, it features smart matching, real-time communication, and a robust gamification system.

![SkillSwap Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop)

## 🚀 Features

- **Authentication**: JWT-based secure auth with Refresh/Access token rotation.
- **Smart Matching**: compatibility scoring based on skill overlap and availability.
- **Real-Time Chat**: Socket.IO-powered messaging with typing indicators and online status.
- **Session Booking**: Calendar-based scheduling with automated notifications.
- **Gamification**: Earn XP, unlock badges, and climb the global leaderboard.
- **Admin Panel**: Full control over users, reports, and platform analytics.
- **Modern UI**: Glassmorphism aesthetic with Framer Motion animations and Dark Mode.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Socket.IO Client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO.
- **Storage**: Cloudinary for portfolio and avatar uploads (with local fallback).

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally `brew services start mongodb-community`)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ayushghimire2026/SkillSwap.git
   cd SkillSwap
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Ensure .env is configured (PORT=5001)
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   # Frontend runs on port 5175 by default
   npm run dev
   ```

The application will be available at `http://localhost:5175`.

## 📂 Project Structure

- `/client`: Frontend source code (Vite + React).
- `/server`: Backend API and Socket.IO logic.
- `API_DOCS.md`: Detailed API reference.

## 📄 License

MIT © 2026 SkillSwap
