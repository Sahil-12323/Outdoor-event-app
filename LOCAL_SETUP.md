# TrailMeet - Local Setup Guide

This guide will help you run the TrailMeet application locally on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Yarn** (package manager)
   - Install: `npm install -g yarn`
   - Verify: `yarn --version`

3. **Python** (v3.8 or higher)
   - Download from: https://www.python.org/
   - Verify: `python --version` or `python3 --version`

4. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

## Installation Steps

### 1. Clone/Download the Repository

If you haven't already, download or clone this repository to your local machine.

### 2. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt
# or on some systems:
pip3 install -r requirements.txt
```

**Note:** If you get an error about `emergentintegrations`, you can safely ignore it or remove that line from `requirements.txt`.

### 3. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
yarn install
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

1. Start MongoDB service:
   - **Windows**: MongoDB should start automatically, or run `mongod` from command prompt
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

2. Verify MongoDB is running:
   ```bash
   mongosh
   # or
   mongo
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended for easy setup)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string (replace `<password>` with your password)
4. Use this connection string in the `.env` file

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `backend/.env` with the following content:

```env
# For local MongoDB
MONGO_URL=mongodb://localhost:27017

# For MongoDB Atlas (alternative)
# MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001
```

## Running the Application

You'll need **TWO terminal windows** - one for backend, one for frontend.

### Terminal 1: Start Backend Server

```bash
# From the project root directory
cd backend

# Run the server
python server.py
# or on some systems:
python3 server.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

### Terminal 2: Start Frontend Application

```bash
# From the project root directory
cd frontend

# Run the development server
yarn start
```

You should see:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
```

## Accessing the Application

Once both servers are running:

1. **Frontend**: Open your browser and go to http://localhost:3000
2. **Backend API**: http://localhost:8001/api/
3. **API Docs**: http://localhost:8001/docs (FastAPI automatic documentation)

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure you installed the requirements: `pip install -r requirements.txt`

**Problem**: `pymongo.errors.ServerSelectionTimeoutError`
- **Solution**: MongoDB is not running. Start MongoDB service.

**Problem**: `emergentintegrations` not found
- **Solution**: Edit `backend/requirements.txt` and remove the line `emergentintegrations==0.1.0`

### Frontend Issues

**Problem**: `command not found: yarn`
- **Solution**: Install yarn: `npm install -g yarn`

**Problem**: Port 3000 is already in use
- **Solution**: Kill the process using port 3000 or change the port:
  ```bash
  PORT=3001 yarn start
  ```

**Problem**: Dependencies installation fails
- **Solution**: Clear cache and try again:
  ```bash
  yarn cache clean
  yarn install
  ```

### MongoDB Issues

**Problem**: Cannot connect to MongoDB
- **Solution**: Ensure MongoDB is running. Check with:
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```

## Project Structure

```
trailmeet/
├── backend/
│   ├── server.py          # FastAPI backend server
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables (create this)
├── frontend/
│   ├── src/              # React source code
│   ├── public/           # Public assets
│   ├── package.json      # Node.js dependencies
│   └── craco.config.js   # Custom webpack config
└── backend_test.py       # API tests
```

## Features

- 🔐 User Authentication (demo mode)
- 📍 Interactive Maps for Events
- 📅 Event Creation & Management
- 💬 Real-time Chat for Events
- 👥 Join/Leave Events
- 📱 Responsive Design with Tailwind CSS

## Tech Stack

### Backend
- FastAPI (Python web framework)
- MongoDB (Database)
- Motor (Async MongoDB driver)
- Pydantic (Data validation)

### Frontend
- React 19
- Tailwind CSS
- shadcn/ui components
- React Router
- Axios

## Development

### Backend Development

The backend uses FastAPI with auto-reload enabled. Any changes to `server.py` will automatically restart the server.

### Frontend Development

The frontend uses React with hot-reload. Changes to React components will automatically reflect in the browser.

## Stopping the Application

1. In each terminal window, press `Ctrl+C` to stop the servers
2. Optionally stop MongoDB:
   - **Mac**: `brew services stop mongodb-community`
   - **Linux**: `sudo systemctl stop mongod`

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- MongoDB Documentation: https://docs.mongodb.com/
- Tailwind CSS: https://tailwindcss.com/

## Need Help?

If you encounter any issues not covered here, please check:
1. Console errors in the browser (F12)
2. Backend server logs in the terminal
3. MongoDB connection status

---

Happy coding! 🚀