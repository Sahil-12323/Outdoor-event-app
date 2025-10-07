#!/bin/bash

echo "🚀 TrailMeet Local Setup Script"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo "⚠️  Yarn not found. Installing yarn..."
    npm install -g yarn
fi
echo "✅ Yarn $(yarn --version) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install from https://www.python.org/"
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas."
    echo "   Visit: https://www.mongodb.com/try/download/community"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend setup
echo ""
echo "🐍 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'ENVEOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=trailmeet
CORS_ORIGINS=http://localhost:3000,http://localhost:8001
ENVEOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo "📥 Installing Python dependencies..."
if grep -q "emergentintegrations" requirements.txt; then
    grep -v "emergentintegrations" requirements.txt > requirements_temp.txt
    pip3 install -r requirements_temp.txt
    rm requirements_temp.txt
else
    pip3 install -r requirements.txt
fi

cd ..

# Frontend setup
echo ""
echo "⚛️  Setting up frontend..."
cd frontend
echo "📥 Installing Node.js dependencies..."
yarn install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "================================"
echo "🎯 To run the application:"
echo "================================"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && python3 server.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && yarn start"
echo ""
echo "Then open: http://localhost:3000"
echo "================================"
