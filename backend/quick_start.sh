#!/bin/bash

# ClaimPilot Quick Start Script
echo "=================================="
echo "ClaimPilot Database Setup"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python3 found"

# Check if in backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Please run this script from the backend directory"
    echo "   cd backend && bash quick_start.sh"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠️  Some dependencies may have failed to install. Continuing..."
fi

# Check .env file
echo ""
if [ ! -f "../.env" ]; then
    echo "❌ .env file not found in project root"
    exit 1
fi

echo "✓ .env file found"

# Test database connection
echo ""
echo "🔌 Testing database connection..."
python3 test_db_connection.py

connection_status=$?

echo ""
echo "=================================="
echo "Setup Status"
echo "=================================="

if [ $connection_status -eq 0 ]; then
    echo "✅ Database connected successfully!"
    echo ""
    echo "🚀 You can now start the server:"
    echo "   uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "📖 API Documentation will be at:"
    echo "   http://localhost:8000/docs"
else
    echo "⚠️  Database setup incomplete"
    echo ""
    echo "Please follow the instructions above to create database tables."
    echo "After creating tables, run this script again or start the server."
fi

echo ""
