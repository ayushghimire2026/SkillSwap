# SkillSwap API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register
- **POST** `/auth/register`
- **Body**: `{ name, email, password }`
- **Response**: `201` - User object + Tokens

### Login
- **POST** `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `200` - User object + Tokens

### Refresh Token
- **POST** `/auth/refresh`
- **Body**: `{ refreshToken }`
- **Response**: `200` - New accessToken

---

## Users

### Get Profile
- **GET** `/users/:id`
- **Auth**: Required
- **Response**: User object with skills, reputation, and portfolio.

### Update Profile
- **PUT** `/users/profile`
- **Body**: `{ bio, location, skillsOffered, skillsWanted, availability }`
- **Auth**: Required

### Leaderboard
- **GET** `/users/leaderboard?sort=xp&limit=10`
- **Response**: Top users ordered by XP or reputation.

---

## Matches

### Get Matches
- **GET** `/matches`
- **Auth**: Required
- **Response**: List of compatible users with matching scores (0-100%).

---

## Sessions

### Request Session
- **POST** `/sessions`
- **Body**: `{ provider, skill, date, timeSlot, notes }`
- **Auth**: Required

### Approve Session
- **PUT** `/sessions/:id/approve`
- **Auth**: Provider Only

### Complete Session
- **PUT** `/sessions/:id/complete`
- **Auth**: Required (triggers XP/Reputation award)

---

## Chat

### Get Conversations
- **GET** `/chat/conversations`
- **Auth**: Required

### Get Messages
- **GET** `/chat/messages/:conversationId?page=1`
- **Auth**: Required

---

## Admin

### Platform Analytics
- **GET** `/admin/analytics`
- **Auth**: Admin Only

### User Management
- **GET** `/admin/users`
- **PUT** `/admin/users/:id/ban`
- **Auth**: Admin Only
