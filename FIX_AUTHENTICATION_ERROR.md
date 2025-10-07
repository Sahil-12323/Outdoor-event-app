# 🔧 Fix: Authentication Failed Error

## Problem: "Authentication failed" error

This means the frontend can now connect to the backend, but the backend has an issue - usually MongoDB connection.

---

## ✅ Solution: Check Backend & MongoDB

### Step 1: Check Backend Terminal

Look at your **backend terminal** (where you ran `python3 server.py`). 

**Do you see errors?** Common ones:
- MongoDB connection errors
- `ServerSelectionTimeoutError`
- `pymongo.errors`

---

### Step 2: Verify MongoDB is Running

#### **Test MongoDB Connection:**

Open a new terminal and run:

```bash
mongosh
```

**Expected**: Should connect successfully
**If it fails**: MongoDB is not running

---

### Step 3: Start MongoDB

#### **Windows:**
```cmd
net start MongoDB
```

If that doesn't work:
1. Open Services (Win+R, type `services.msc`)
2. Find "MongoDB Server"
3. Right-click → Start

#### **Mac:**
```bash
brew services start mongodb-community
```

Verify:
```bash
brew services list | grep mongodb
```

#### **Linux:**
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

#### **Alternative: Use MongoDB Atlas (Cloud)**

If local MongoDB won't work, use the cloud version (free):

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=trailmeet
   CORS_ORIGINS=http://localhost:3000,http://localhost:8001
   ```
   (Replace username and password with your credentials)

---

### Step 4: Restart Backend

After starting MongoDB:

1. **Stop backend** (Ctrl+C in backend terminal)
2. **Start it again**:
   ```bash
   cd backend
   python3 server.py
   ```

**Look for this message:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:__main__:Database indexes created successfully
```

**If you see**:
```
ERROR: Could not connect to MongoDB
```
MongoDB is still not running or connection string is wrong.

---

### Step 5: Test Backend API

In a new terminal:

```bash
curl http://localhost:8001/api/
```

**Expected:**
```json
{"message":"TrailMeet API is running","status":"healthy"}
```

**Test authentication endpoint:**
```bash
curl -X POST http://localhost:8001/api/auth/session
```

**Expected:** JSON with user data and session_token

---

### Step 6: Refresh Frontend

Once backend is working:
1. Go to http://localhost:3000
2. Press **Ctrl+Shift+R** (hard refresh)
3. Or open browser DevTools (F12) → Application → Clear storage

---

## 🔍 Debug Checklist

Run through this checklist:

### ✅ MongoDB Status
```bash
# Test connection
mongosh

# Should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/...
# Using MongoDB: ...
```

### ✅ Backend .env File
```bash
cat backend/.env
```

Should show:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001
```

### ✅ Backend Running
Check backend terminal for:
- ✅ "Uvicorn running on http://0.0.0.0:8001"
- ✅ "Database indexes created successfully"
- ❌ NO MongoDB connection errors

### ✅ Backend Health
```bash
curl http://localhost:8001/api/
```

### ✅ Backend Auth Endpoint
```bash
curl -X POST http://localhost:8001/api/auth/session
```

---

## 🐛 Common Errors & Solutions

### Error: "ServerSelectionTimeoutError"

**Cause**: MongoDB is not running or wrong connection string

**Solution**:
1. Start MongoDB (see Step 3)
2. Verify `.env` has correct `MONGO_URL`
3. Test with `mongosh`

### Error: "ModuleNotFoundError: No module named 'pymongo'"

**Cause**: Backend dependencies not installed

**Solution**:
```bash
cd backend
pip3 install -r requirements.txt
```

### Error: Port 8001 already in use

**Cause**: Another process using port 8001

**Solution**:

**Windows**:
```cmd
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux**:
```bash
lsof -ti:8001 | xargs kill -9
```

### Error: CORS errors in browser

**Cause**: Backend CORS not configured properly

**Solution**:
1. Check `backend/.env` has:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:8001
   ```
2. Restart backend

---

## 🎯 Complete Restart Procedure

If nothing works, do a complete restart:

### 1. Stop Everything
- Stop frontend (Ctrl+C)
- Stop backend (Ctrl+C)
- Stop MongoDB (if running)

### 2. Start MongoDB
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 3. Verify MongoDB
```bash
mongosh
# Type: exit
```

### 4. Check Environment Files

**backend/.env**:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001
```

**frontend/.env**:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 5. Start Backend (Terminal 1)
```bash
cd backend
python3 server.py
```

Wait for:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:__main__:Database indexes created successfully
```

### 6. Test Backend
```bash
curl http://localhost:8001/api/
curl -X POST http://localhost:8001/api/auth/session
```

### 7. Start Frontend (Terminal 2)
```bash
cd frontend
yarn start
```

Wait for:
```
Compiled successfully!
```

### 8. Open Browser
Go to: http://localhost:3000

---

## 💡 Quick Test Script

Save this as `test_backend.sh`:

```bash
#!/bin/bash
echo "Testing MongoDB..."
mongosh --eval "db.version()" --quiet && echo "✅ MongoDB OK" || echo "❌ MongoDB FAILED"

echo ""
echo "Testing Backend API..."
curl -s http://localhost:8001/api/ | grep -q "healthy" && echo "✅ Backend API OK" || echo "❌ Backend API FAILED"

echo ""
echo "Testing Backend Auth..."
curl -s -X POST http://localhost:8001/api/auth/session | grep -q "session_token" && echo "✅ Backend Auth OK" || echo "❌ Backend Auth FAILED"
```

Run:
```bash
chmod +x test_backend.sh
./test_backend.sh
```

---

## 🆘 Still Not Working?

### Check Browser Console (F12)
Look for specific error messages in the Console tab

### Check Network Tab (F12)
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red)
5. Click on failed request to see error details

### Check Backend Logs
Look at the backend terminal for any error messages when you refresh the frontend

---

## 📞 What to Share if You Need More Help

If still having issues, share:
1. Backend terminal output (full log)
2. Browser console errors (F12 → Console)
3. Result of: `curl http://localhost:8001/api/`
4. Result of: `mongosh` (does it connect?)

---

After fixing MongoDB connection and restarting backend, the authentication should work! 🎉