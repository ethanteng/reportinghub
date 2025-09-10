#!/bin/bash

echo "🚀 Starting ReportingHub Permissions Hub..."

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Server is already running on port 3000"
    echo "   Open http://localhost:3000 in your browser"
    echo "   Press Ctrl+C to stop the server"
    exit 0
fi

# Start the development server
echo "📡 Starting development server..."
npm run dev
