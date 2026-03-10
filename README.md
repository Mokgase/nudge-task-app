# TaskFlow — Habit-Tracking Todo App

A minimalist task tracker with habit analytics, built with **React + Vite + Firebase**.

---

## Features

- ✅ Add, complete, and delete tasks
- ⏱ Per-task stopwatch tracking actual time spent
- 📅 Deadlines with countdown display
- ⏰ Allocated time vs actual time comparison
- 📊 Dashboard with daily activity chart
- 📈 Weekly progress report with score & rating
- 🔐 Email/password + Google sign-in
- 📧 Password reset via email
- ☁️ All data persists in Firebase Firestore

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Create a new project** (e.g. `taskflow-app`)
3. Click **Add app → Web** and register it
4. Copy the `firebaseConfig` values shown

5. In your Firebase project:
   - Go to **Authentication → Sign-in methods**
   - Enable **Email/Password**
   - Enable **Google**

6. Go to **Firestore Database → Create database**
   - Start in **test mode** (you'll secure it with rules after)

7. Go to **Firestore → Rules** and paste the contents of `firestore.rules`

### 3. Add your Firebase config

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthPage.jsx        # Auth router (login/signup/reset)
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── ResetPassword.jsx
│   ├── Dashboard/
│   │   └── DashboardPage.jsx   # Stats, charts, pending list
│   ├── Habits/
│   │   └── ReportPage.jsx      # Weekly report & habit analysis
│   ├── Layout/
│   │   └── Sidebar.jsx         # Navigation sidebar
│   └── Tasks/
│       ├── TaskCard.jsx        # Individual task with stopwatch
│       └── TasksPage.jsx       # Task list with filters & add form
├── context/
│   └── AuthContext.jsx         # Firebase Auth state
├── firebase/
│   ├── config.js               # Firebase initialization ← EDIT THIS
│   └── tasksService.js         # Firestore CRUD operations
├── hooks/
│   └── useStopwatch.js         # Per-task elapsed time hook
├── styles/
│   ├── auth.css
│   ├── dashboard.css
│   ├── global.css
│   ├── layout.css
│   └── tasks.css
└── utils/
    └── taskUtils.js            # Stats, formatting, weekly score

firestore.rules                 # Firestore security rules
```

---

## Weekly Score Algorithm

The score (0–100) is calculated as:
- **40%** — Task completion rate (completed / total)
- **40%** — On-time completion rate (completed before deadline)
- **20%** — Time estimation accuracy (allocated vs actual)

**Ratings:**
| Score | Rating |
|-------|--------|
| 90–100 | 🏆 Exceptional |
| 75–89 | ⭐ Excellent |
| 60–74 | ✅ Good Progress |
| 40–59 | 📈 Improving |
| 20–39 | ⚡ Needs Focus |
| 0–19 | 🌱 Getting Started |

---

## Build for Production

```bash
npm run build
```

Output is in the `dist/` folder — deploy to Vercel, Netlify, or Firebase Hosting.
