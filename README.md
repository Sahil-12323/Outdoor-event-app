# TrailMeet - Outdoor Events Platform

A full-stack web application for creating and managing outdoor events and adventures.

## 🚀 Quick Start - Run Locally

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- MongoDB
- Yarn

### Option 1: Automated Setup
```bash
# Run the setup script
./run_locally.sh

# Then in two separate terminals:
# Terminal 1 - Backend
cd backend && python3 server.py

# Terminal 2 - Frontend
cd frontend && yarn start
```

### Option 2: Using npm scripts
```bash
# Install dependencies
npm run install:backend
npm run install:frontend

# Run in separate terminals
npm run backend    # Terminal 1
npm run frontend   # Terminal 2
```

### Option 3: Manual Setup
See [QUICK_START.md](./QUICK_START.md) or [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed instructions.

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Fast setup in 5 steps
- **[Local Setup Guide](./LOCAL_SETUP.md)** - Detailed installation guide
- **Backend Test**: `python3 backend_test.py`

## 🌐 Access

Once running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/
- **API Docs**: http://localhost:8001/docs

## 🛠️ Tech Stack

### Backend
- FastAPI
- MongoDB
- Motor (Async MongoDB driver)
- Pydantic

### Frontend
- React 19
- Tailwind CSS
- shadcn/ui
- React Router
- Axios

## ✨ Features

- 🔐 User Authentication
- 📍 Interactive Maps
- 📅 Event Management
- 💬 Event Chat
- 👥 Join/Leave Events
- 📱 Responsive Design

## 📁 Project Structure

```
trailmeet/
├── backend/
│   ├── server.py          # FastAPI server
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment config (create this)
├── frontend/
│   ├── src/              # React source
│   └── package.json      # Node dependencies
└── backend_test.py       # API tests
```

## 🐛 Troubleshooting

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for common issues and solutions.

---

Happy coding! 🚀
