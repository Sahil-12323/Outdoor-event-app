# Quick Start Guide - Run Locally

## ⚡ Quick Steps

### 1. Prerequisites Check
```bash
node --version    # Should be v16+
yarn --version    # If not installed: npm install -g yarn
python3 --version # Should be v3.8+
mongod --version  # MongoDB should be installed
```

### 2. Start MongoDB
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB should auto-start, or run: net start MongoDB
```

### 3. Backend Setup
```bash
cd backend
pip3 install -r requirements.txt
# If emergentintegrations fails, remove that line from requirements.txt and try again

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017
DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001" > .env

# Start backend
python3 server.py
```

### 4. Frontend Setup (New Terminal)
```bash
cd frontend
yarn install
yarn start
```

### 5. Open Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/
- API Docs: http://localhost:8001/docs

## 🎯 That's it!

You should now see the TrailMeet application running on your local machine.

## 🐛 Quick Fixes

**Backend won't start?**
- Make sure MongoDB is running
- Check if port 8001 is available

**Frontend won't start?**
- Clear cache: `yarn cache clean && yarn install`
- Try different port: `PORT=3001 yarn start`

**Can't connect to MongoDB?**
- Verify MongoDB is running: `mongosh` (should connect without error)
- Or use MongoDB Atlas cloud: Update MONGO_URL in .env

---

For detailed setup instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)