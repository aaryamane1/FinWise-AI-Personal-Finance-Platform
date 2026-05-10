#!/bin/bash
# FinWise Mac/Linux Startup Automator

echo "🚀 Starting FinWise Ecosystem for Mac/Linux..."

# 1. Kill existing processes on target ports (8000 and 5173)
echo "🔍 Checking for existing services on ports 8000 and 5173..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 2. Setup Backend
echo -e "\n📦 Preparing Backend..."
cd Backend || exit

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

echo "🛠  Installing/Updating Backend Dependencies..."
source venv/bin/activate
pip install -r requirements.txt --quiet
pip install "pydantic[email]" --quiet

if [ ! -f ".env" ]; then
    echo "⚠️  .env missing. Copying from .env.example..."
    cp .env.example .env
fi

# Launch Backend in background
echo "⚡ Launching Backend on http://localhost:8000..."
python3 -m app.main &
BACKEND_PID=$!
deactivate
cd ..

# 3. Setup Frontend
echo -e "\n🎨 Preparing Frontend..."
cd finwise-frontend || exit

if ! command -v npm &> /dev/null; then
    echo "❌ Node.js (npm) is not installed or not in PATH."
    kill $BACKEND_PID
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies missing. Installing with npm..."
    npm install
fi

# Launch Frontend
echo "⚡ Launching Frontend on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n✨ FinWise is coming alive!"
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend:  http://localhost:8000"
echo -e "\nPress Ctrl+C to stop both services."

# Trap Ctrl+C to kill both background processes
trap "echo -e '\nStopping FinWise services...'; kill $BACKEND_PID $FRONTEND_PID; exit" EXIT

# Wait for background processes
wait
