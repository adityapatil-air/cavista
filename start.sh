#!/bin/bash

# Cavista Full Stack Startup Script
# This script starts both backend and frontend servers concurrently

echo "🚀 Starting Cavista Full Stack Application..."
echo "================================================"

# Function to cleanup background processes on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "cavista/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd cavista/backend
    npm install
    cd ../..
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "cavista/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd cavista/frontend
    npm install
    cd ../..
fi

echo ""
echo "🔧 Starting Backend Server (Port 5001)..."
cd cavista/backend
npm run dev &
BACKEND_PID=$!

echo "🎨 Starting Frontend Server (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

cd ../..

echo ""
echo "✅ Both servers are starting up..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID