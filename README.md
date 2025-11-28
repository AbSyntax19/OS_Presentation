# Multi-Role Authentication Demo

A React web application demonstrating **role-based authentication** with real-time messaging capabilities, built for an Operating Systems presentation.

![Multi-Role Auth Demo](https://img.shields.io/badge/React-18-blue)  ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Real--time](https://img.shields.io/badge/Real--time-Messaging-green)

## 🎯 Features

### Authentication & Authorization
- 🔐 **Role-Based Access Control** (RBAC) - Two roles: Admin and User
- 👤 **Quick Login** - Pre-configured demo accounts for easy testing
- 🔒 **Session Persistence** - Maintains login state across page refreshes

### User Features
- 💬 **Real-Time Messaging** - Instant message synchronization across browser tabs/windows
- 📝 **Message Composition** - Character-limited messaging (500 chars)
- 👀 **Message History** - View all messages from all users
- 🚫 **Blocked State Handling** - Clear feedback when blocked by admin

### Admin Features
- 📢 **Broadcast Messaging** - Send announcements to all users
- 👨‍💼 **Special Admin Badge** - Visual distinction for admin messages
- 🗑️ **Message Moderation** - Delete any message with confirmation
- 🚫 **User Management** - Block/unblock users
- 📊 **Statistics Dashboard** - Real-time stats for messages, users, and activity
- 🔍 **Search & Filter** - Find messages by user or content
- ⚠️ **Spam Detection** - Monitor high-activity users

### Design
- 🎨 **Premium UI** - Glassmorphism effects and smooth animations
- 🌈 **Role-Specific Themes** - Blue for users, Red/Pink for admin
- 📱 **Responsive Design** - Works on all screen sizes
- ✨ **Smooth Animations** - Micro-interactions and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd osppt

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔑 Demo Accounts

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| 👨‍💼 Admin | `admin` | `admin123` | Full access - can send messages, delete, block users |
| 👤 User | `user1` | `user123` | Alice Johnson - Regular user |
| 👤 User | `user2` | `user123` | Bob Smith - Regular user |
| 👤 User | `user3` | `user123` | Charlie Davis - Regular user |

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: Vanilla CSS with CSS custom properties
- **State Management**: React Context API
- **Real-Time**: Mock Firestore (localStorage + events)
- **Fonts**: Google Fonts (Inter)

### Project Structure
```
src/
├── components/          # React components
│   ├── Login.jsx       # Login interface
│   ├── Header.jsx      # App header
│   ├── UserDashboard.jsx    # User view
│   └── AdminDashboard.jsx   # Admin control panel
├── contexts/           # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   └── MessageContext.jsx   # Messaging & moderation
├── firebase/           # Mock real-time database
│   ├── config.js            # Firebase config (demo)
│   └── mockFirestore.js     # Real-time simulation
├── App.jsx             # Main app component
├── main.jsx            # React entry point
└── index.css           # Global styles & design system
```

## 💡 Key Features Explained

### Real-Time Messaging
Uses a mock Firebase implementation that simulates Firestore behavior:
- **localStorage** for data persistence
- **Custom events** for same-tab updates
- **Storage API** for cross-tab synchronization

### Spam Prevention
- Rate limiting: Maximum 3 messages per 10 seconds
- Automatic detection with user feedback
- Admin users exempt from spam limits

### User Blocking
- Admins can block/unblock any user
- Blocked users cannot send messages
- Real-time enforcement across all sessions

## 🎓 Presentation Tips

1. **Start with Real-Time Demo**
   - Open 2-3 browser windows side by side
   - Show messages appearing instantly across windows

2. **Demonstrate Admin Power**
   - Login as admin
   - Send a broadcast message
   - Show it appearing in user windows with admin badge

3. **Show User Blocking**
   - Block a user while they're logged in
   - Show blocked state and error message

4. **Test Spam Prevention**
   - Rapidly send messages to trigger rate limiting
   - Show error message after 3 messages

## 📦 Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔒 Security Note

> **⚠️ This is a demonstration application**
>
> The current implementation uses:
> - Mock authentication (no password hashing)
> - localStorage for data persistence
> - Client-side validation only
>
> For production use, implement:
> - Proper backend authentication (JWT/OAuth)
> - Secure password hashing (bcrypt)
> - Server-side validation
> - Real database (Firebase, MongoDB, PostgreSQL)
> - HTTPS connections
> - CSRF protection

## 📝 License

This project is created for educational purposes as part of an Operating Systems presentation.

## 🙏 Acknowledgments

Built with React, Vite, and modern web technologies to demonstrate role-based access control and real-time messaging concepts.

---

**Built for OS Presentation** | Multi-Role Authentication Demo
