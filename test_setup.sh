#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Testing TrailMeet Setup - Diagnostics                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: MongoDB
echo "1️⃣  Testing MongoDB..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo "   ✅ MongoDB is running"
        mongosh --eval "db.version()" --quiet | head -1
    else
        echo "   ❌ MongoDB is NOT running"
        echo "      Fix: Start MongoDB service"
    fi
else
    echo "   ❌ mongosh not found (MongoDB not installed)"
    echo "      Fix: Install MongoDB or use MongoDB Atlas"
fi

echo ""

# Test 2: Backend .env
echo "2️⃣  Testing Backend .env..."
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    cat backend/.env
else
    echo "   ❌ backend/.env NOT found"
    echo "      Fix: Create backend/.env file"
fi

echo ""

# Test 3: Frontend .env
echo "3️⃣  Testing Frontend .env..."
if [ -f "frontend/.env" ]; then
    echo "   ✅ frontend/.env exists"
    cat frontend/.env
else
    echo "   ❌ frontend/.env NOT found"
    echo "      Fix: Create frontend/.env file"
fi

echo ""

# Test 4: Backend API
echo "4️⃣  Testing Backend API..."
if curl -s http://localhost:8001/api/ | grep -q "healthy"; then
    echo "   ✅ Backend API is running and healthy"
else
    echo "   ❌ Backend API is NOT responding"
    echo "      Fix: Start backend server (cd backend && python3 server.py)"
fi

echo ""

# Test 5: Backend Auth
echo "5️⃣  Testing Backend Authentication..."
if curl -s -X POST http://localhost:8001/api/auth/session | grep -q "session_token"; then
    echo "   ✅ Backend authentication working"
else
    echo "   ❌ Backend authentication FAILED"
    echo "      This usually means MongoDB is not running"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                      Diagnosis Complete                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

