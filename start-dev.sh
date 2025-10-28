#!/bin/bash

# Start development environment for Trading Bot

echo "🚀 Starting Trading Bot Development Environment..."

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  Backend .env not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env and add your API keys!"
fi

if [ ! -f frontend/.env ]; then
    echo "⚠️  Frontend .env not found. Copying from .env.example..."
    cp frontend/.env.example frontend/.env
fi

# Check if node_modules exist
if [ ! -d backend/node_modules ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d frontend/node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start PostgreSQL (if using Docker)
echo "🐘 Starting PostgreSQL..."
docker-compose -f docker/docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Start backend
echo "🔧 Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Trading Bot is running!"
echo ""
echo "📊 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:3000"
echo "🐘 PostgreSQL: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID
