# 🎯 Running TrailMeet in VSCode Locally

This guide is specifically for running the TrailMeet application on **your local VSCode**.

## 📋 Step-by-Step Instructions

### Step 1: Download/Clone the Project

First, get the project files onto your local machine:
- Clone this repository, or
- Download as ZIP and extract

### Step 2: Open in VSCode

1. Open VSCode
2. File → Open Folder
3. Select the `trailmeet` (or workspace) folder

### Step 3: Install Prerequisites

You need these installed on your computer:

#### ✅ Node.js & Yarn
1. Download Node.js from https://nodejs.org/ (v16 or higher)
2. After installing Node.js, open Terminal in VSCode and run:
   ```bash
   npm install -g yarn
   ```

#### ✅ Python
1. Download Python from https://www.python.org/ (v3.8 or higher)
2. During installation, **check "Add Python to PATH"**

#### ✅ MongoDB
Choose ONE option:

**Option A: Local MongoDB (Recommended for learning)**
- Download from https://www.mongodb.com/try/download/community
- Install and start the MongoDB service

**Option B: MongoDB Atlas (Cloud - Easier)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Use this in your `.env` file (see Step 4)

### Step 4: Quick Setup (Automated)

#### On Mac/Linux:
Open VSCode Terminal (`` Ctrl+` ``) and run:
```bash
./run_locally.sh
```

#### On Windows:
Open VSCode Terminal (`` Ctrl+` ``) and run:
```cmd
run_locally.bat
```

This will:
- Check if prerequisites are installed
- Install all dependencies
- Create the `.env` configuration file

### Step 5: Run the Application

You need **TWO terminal windows** in VSCode.

#### Terminal 1 - Backend:
1. In VSCode: Terminal → New Terminal
2. Run:
   ```bash
   cd backend
   python server.py
   ```
   **On Windows**, you might need:
   ```cmd
   cd backend
   python server.py
   ```

   **On Mac/Linux**, you might need:
   ```bash
   cd backend
   python3 server.py
   ```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

#### Terminal 2 - Frontend:
1. In VSCode: Click the **+** button to create a new terminal
2. Run:
   ```bash
   cd frontend
   yarn start
   ```

You should see:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
```

### Step 6: Open in Browser

Open your browser and go to:
**http://localhost:3000**

You should see the TrailMeet application! 🎉

## 🎨 VSCode Tips

### Recommended Extensions
- Python (Microsoft)
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense

### Split Terminal View
- Click the split terminal button in VSCode terminal panel
- This lets you see both backend and frontend running simultaneously

### Debug Configuration
You can add these to `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "server:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8001"
      ],
      "jinja": true,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

## 🔧 Manual Setup (If Automated Fails)

### Backend:
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file manually
# Create a file named .env in the backend folder with:
MONGO_URL=mongodb://localhost:27017
DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001

# Run server
python server.py
```

### Frontend:
```bash
cd frontend

# Install dependencies
yarn install

# Start dev server
yarn start
```

## 🐛 Common Issues & Solutions

### Issue: "python: command not found"
**Solution**: Use `python3` instead of `python`

### Issue: "yarn: command not found"  
**Solution**: Install yarn: `npm install -g yarn`

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Make sure MongoDB is running
- On Windows: Check Services → MongoDB is running
- On Mac: `brew services start mongodb-community`
- On Linux: `sudo systemctl start mongod`

### Issue: Port 3000 already in use
**Solution**: 
```bash
PORT=3001 yarn start
```

### Issue: "emergentintegrations not found"
**Solution**: 
1. Open `backend/requirements.txt`
2. Delete the line: `emergentintegrations==0.1.0`
3. Save and run `pip install -r requirements.txt` again

### Issue: MongoDB connection error
**Solution**: 
Check your `.env` file:
- For local MongoDB: `MONGO_URL=mongodb://localhost:27017`
- For Atlas: `MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/`

## 📱 URLs When Running Locally

- **Frontend (React App)**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/
- **Interactive API Docs**: http://localhost:8001/docs
- **MongoDB**: localhost:27017

## 🎯 Quick Commands Reference

```bash
# Start backend
cd backend && python3 server.py

# Start frontend  
cd frontend && yarn start

# Install backend deps
cd backend && pip3 install -r requirements.txt

# Install frontend deps
cd frontend && yarn install

# Run API tests
python3 backend_test.py
```

## 📚 Additional Resources

- **QUICK_START.md** - 5-step quick guide
- **LOCAL_SETUP.md** - Detailed setup instructions
- **README.md** - Project overview

## 🆘 Still Having Issues?

1. Check the console output in both terminals for error messages
2. Check browser console (F12) for frontend errors
3. Make sure all prerequisites are installed correctly
4. Try restarting VSCode
5. Check MongoDB is running: 
   - Try connecting with `mongosh` command
   - Or check MongoDB Compass

## ✨ You're Ready!

Once you see:
- ✅ Backend running on port 8001
- ✅ Frontend running on port 3000
- ✅ No errors in the terminals

You can start using the application at http://localhost:3000

---

Happy coding! If you need help, check the troubleshooting section above. 🚀