# StockIQ — Fixed & Setup Guide

## 🐛 Bugs Found & Fixed

### Bug 1 — `Inventory.js` using raw `axios` instead of the shared API service
**File:** `frontend/src/components/Inventory.js`

**Problem:** This component imported `axios` directly and manually attached the auth token in every request header. This is fragile — if the token is missing or the header format changes, this component silently fails with a 401 error.

```js
// ❌ BEFORE (broken)
import axios from 'axios';
const res = await axios.get('/api/products', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
```

```js
// ✅ AFTER (fixed)
import { getProducts } from '../services/api';
const res = await getProducts();  // token auto-attached by interceptor
```

---

### Bug 2 — `Reports.js` using raw `axios` instead of the shared API service
**File:** `frontend/src/components/Reports.js`

**Problem:** Same as Bug 1 — manually grabbed the token and passed it as a header instead of using the shared `api.js` service. The interceptor in `api.js` exists specifically so you never have to do this.

```js
// ❌ BEFORE (broken)
import axios from 'axios';
const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
axios.get('/api/products/stats', { headers }),
axios.get('/api/products', { headers }),
```

```js
// ✅ AFTER (fixed)
import { getProducts, getProductStats } from '../services/api';
getProductStats(),
getProducts(),
```

---

### Bug 3 — Phantom empty directories with brace-expansion names
**Files:** 
- `backend/{config,controllers,middleware,models,routes}/`  (empty folder)
- `frontend/src/{components,context,services,styles}/`  (empty folder)

**Problem:** These directories were created by a shell brace-expansion gone wrong — they are literal folder names with `{` and `}` in them. They are completely empty and serve no purpose, but they may confuse editors and some tools. They have been removed in this fixed version.

---

### Bug 4 — No `.env.example` file
**Problem:** The `.env` file contains real secrets and is (correctly) not committed to git. However, there was no `.env.example` to tell developers what variables they need. A `.env.example` has been added.

---

## ✅ What is Working (No Changes Needed)

- Backend Express server, routes, middleware — all correct
- JWT authentication for both Admin and Staff roles
- MongoDB schema with auto-status (In Stock / Low Stock / Out of Stock)
- Password hashing with bcrypt
- Seed script with sample data and default admin account
- Frontend React app with AuthContext, sidebar navigation, dashboard charts
- Products CRUD (create, read, update, delete)
- Staff management (admin only)
- `proxy` field in `frontend/package.json` correctly set to `http://localhost:5000`

---

## 🚀 Step-by-Step Setup Guide

### Prerequisites — Install these first

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| MongoDB Community | 6 or higher | https://www.mongodb.com/try/download/community |
| npm | comes with Node.js | — |

---

### Step 1 — Install MongoDB and start it

#### Windows
1. Download MongoDB Community from https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" setup)
3. Make sure "Install MongoDB as a Service" is checked
4. MongoDB will start automatically on boot

Verify it's running — open Command Prompt and type:
```
mongosh
```
You should see a `>` prompt. Type `exit` to quit.

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Ubuntu / Debian Linux
```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Verify MongoDB is running:
```bash
mongosh
# You should see a > prompt — type exit to quit
```

---

### Step 2 — Clone / Extract the project

If you downloaded the zip, extract it. Your folder structure should look like this:

```
StockIQ-Fixed/
├── backend/
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    ├── public/
    └── package.json
```

---

### Step 3 — Set up the Backend

Open a terminal and navigate to the `backend` folder:

```bash
cd StockIQ-Fixed/backend
```

**Install dependencies:**
```bash
npm install
```

**Check your `.env` file** — it should already exist with this content:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/StockIQ
JWT_SECRET=stockiq_super_secret_key_2024
```

> ⚠️ If the `.env` file is missing, create it manually with the content above.

**Seed the database** (creates the admin account + 10 sample products):
```bash
node seed.js
```

You should see:
```
✅ MongoDB Connected: localhost
🗑️  Old data removed
👤 Admin created  →  username: admin  |  password: admin123
📦 10 sample products inserted
✅ Database seeding completed!
```

**Start the backend server:**
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

> Keep this terminal open — the backend must stay running.

---

### Step 4 — Set up the Frontend

Open a **second terminal window** and navigate to the `frontend` folder:

```bash
cd StockIQ-Fixed/frontend
```

**Install dependencies:**
```bash
npm install
```

> This may take 1-3 minutes — it installs React, axios, recharts, etc.

**Start the frontend:**
```bash
npm start
```

Your browser will automatically open at **http://localhost:3000**

---

### Step 5 — Log In

On the login page:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

1. Make sure **Admin** tab is selected (default)
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click **Sign in as admin**

---

### Step 6 — Explore the App

| Page | What it does |
|------|-------------|
| Dashboard | Shows total products, stock counts, charts |
| Products | Add, edit, delete products (admin can delete, staff can add/edit) |
| Inventory | View stock levels with visual progress bars |
| Reports | Charts by category, top 5 products by quantity |
| Staff Management | Admin can create staff accounts, suspend/activate them |
| Settings | Admin profile view |

---

## 🔄 Running Again After Restart

When you restart your computer, you need to:

1. **Start MongoDB** (if not set as a service):
   - Windows: It should auto-start as a service
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongodb`

2. **Start the backend** (in `backend/` folder):
   ```bash
   npm run dev
   ```

3. **Start the frontend** (in `frontend/` folder):
   ```bash
   npm start
   ```

> You do NOT need to run `node seed.js` again — your data is saved in MongoDB.

---

## 🔧 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MongoServerError: connect ECONNREFUSED` | MongoDB is not running | Start MongoDB (Step 1) |
| `Cannot find module 'express'` | npm install not run | Run `npm install` in backend folder |
| `Network Error` in browser | Backend not running | Run `npm run dev` in backend folder |
| White screen / blank page | Frontend not started | Run `npm start` in frontend folder |
| `Login failed` | Seed not run | Run `node seed.js` in backend folder |
| Port 5000 already in use | Another process using port | Kill it: `npx kill-port 5000` |
| Port 3000 already in use | Another process using port | Kill it: `npx kill-port 3000` |

---

## 🏗️ Project Architecture

```
Frontend (React :3000)
    │
    │  HTTP requests via axios (proxy → :5000)
    ▼
Backend (Express :5000)
    │
    ├── /api/auth/login      → Admin login
    ├── /api/staff/login     → Staff login
    ├── /api/staff           → Staff CRUD (admin only)
    └── /api/products        → Products CRUD
    │
    ▼
MongoDB (localhost:27017)
    └── Database: StockIQ
        ├── admins
        ├── staffs
        └── products
```
