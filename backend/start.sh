#!/bin/bash

# Install dependencies if not already installed
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting Bridge POD Management Backend..."
echo "Server will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py 