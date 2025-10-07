# 🔧 Troubleshooting - App Stuck on "Getting Started"

## Problem: Frontend Stuck on Loading/Getting Started Screen

If your application is stuck on the "Getting Started..." screen and not loading, this is usually caused by the **frontend not being able to connect to the backend**.

---

## ✅ Solution: Create Frontend .env File

The frontend needs to know where the backend is running.

### Step 1: Create `.env` file in frontend folder

**Location**: `frontend/.env`

**Contents**:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Step 2: Restart the frontend

After creating the `.env` file:

1. Stop the frontend (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   cd frontend
   yarn start
   ```

3. Wait for it to compile (you should see "Compiled successfully!")

4. Open http://localhost:3000

---

## 🔍 How to Check if Backend is Running

Open a new terminal and run:

```bash
curl http://localhost:8001/api/
```

**Expected response**:
```json
{"message":"TrailMeet API is running","status":"healthy"}
```

**If you get an error**:
- The backend is not running
- Start it: `cd backend && python3 server.py`

---

## 🐛 Other Common Issues

### Issue 1: Backend Not Running

**Symptoms**: 
- "Getting Started..." screen stays forever
- Console shows network errors to localhost:8001

**Solution**:
```bash
# Terminal 1 - Start backend
cd backend
python3 server.py  # or python server.py on Windows
```

Wait until you see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### Issue 2: MongoDB Not Running

**Symptoms**:
- Backend shows MongoDB connection errors
- Backend crashes or won't start

**Solution**:

**Windows**:
```cmd
net start MongoDB
```

**Mac**:
```bash
brew services start mongodb-community
```

**Linux**:
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (Cloud - no local install needed):
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   ```

### Issue 3: Port Already in Use

**Symptoms**:
- Error: "Port 3000 is already in use"
- Error: "Port 8001 is already in use"

**Solution for Port 3000** (Frontend):
```bash
# Find and kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 yarn start
```

**Solution for Port 8001** (Backend):
```bash
# Find and kill process on port 8001
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8001 | xargs kill -9
```

### Issue 4: CORS Errors in Browser Console

**Symptoms**:
- Browser console shows CORS errors
- "Access to fetch blocked by CORS policy"

**Solution**:
1. Make sure backend `.env` has correct CORS settings:
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:8001
   ```
2. Restart backend server

### Issue 5: Location Permission Issues

**Symptoms**:
- App asks for location permission repeatedly
- App stuck waiting for location

**Solution**:
1. Allow location access when prompted
2. If denied, the app should still work with default location (Mumbai)
3. To reset permission:
   - Chrome: Settings → Privacy → Site Settings → Location
   - Find localhost:3000 and reset permission

---

## 📱 Complete Checklist

Before running the app, make sure:

- [ ] **MongoDB is running**
  ```bash
  # Test: mongosh (should connect)
  ```

- [ ] **Backend .env exists** (`backend/.env`)
  ```env
  MONGO_URL=mongodb://localhost:27017
  DB_NAME=trailmeet
  CORS_ORIGINS=http://localhost:3000,http://localhost:8001
  ```

- [ ] **Frontend .env exists** (`frontend/.env`)
  ```env
  REACT_APP_BACKEND_URL=http://localhost:8001
  ```

- [ ] **Backend is running**
  ```bash
  cd backend && python3 server.py
  # Should show: Uvicorn running on http://0.0.0.0:8001
  ```

- [ ] **Frontend is running**
  ```bash
  cd frontend && yarn start
  # Should show: Compiled successfully!
  ```

- [ ] **Backend health check passes**
  ```bash
  curl http://localhost:8001/api/
  # Should return: {"message":"TrailMeet API is running","status":"healthy"}
  ```

---

## 🎯 Quick Fix Commands

Run these in order:

```bash
# 1. Create frontend .env
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > frontend/.env

# 2. Verify backend .env exists
cat backend/.env

# 3. Start MongoDB (choose your OS)
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

# 4. Terminal 1 - Start Backend
cd backend && python3 server.py

# 5. Terminal 2 - Start Frontend (after backend is running)
cd frontend && yarn start

# 6. Open browser
# http://localhost:3000
```

---

## 🔍 Debug Mode

To see what's happening, check:

### Browser Console (F12)
- Look for red errors
- Check Network tab for failed requests to backend

### Backend Terminal
- Should show incoming requests
- Look for any error messages

### Frontend Terminal
- Should show "Compiled successfully!"
- No errors during compilation

---

## 💡 Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Clear localStorage**: F12 → Application → Local Storage → Clear
3. **Restart VSCode**
4. **Try a different browser** (Chrome recommended)
5. **Check firewall**: Make sure localhost:3000 and localhost:8001 are not blocked

---

## 📞 Need More Help?

Check these files for additional information:
- `VSCode_LOCAL_SETUP.md` - Complete setup guide
- `QUICK_START.md` - Quick setup steps
- `LOCAL_SETUP.md` - Detailed installation guide

---

After creating the `.env` file and restarting, your app should load properly! 🎉