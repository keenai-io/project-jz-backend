#!/bin/bash

# Firebase Emulator Cleanup Script
# Use this when emulators get stuck during shutdown

set -e

echo "🧹 Cleaning up Firebase emulators..."

# Function to kill processes by pattern
kill_processes() {
    local pattern=$1
    local description=$2
    
    echo "Checking for $description processes..."
    
    # Find PIDs matching the pattern
    local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo "Found $description processes: $pids"
        echo "Terminating $description processes..."
        
        # Try graceful termination first
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        local remaining=$(pgrep -f "$pattern" 2>/dev/null || true)
        if [ -n "$remaining" ]; then
            echo "Force killing remaining $description processes: $remaining"
            echo "$remaining" | xargs kill -KILL 2>/dev/null || true
        fi
        
        echo "✅ $description processes cleaned up"
    else
        echo "No $description processes found"
    fi
}

# Kill Firebase emulator processes
kill_processes "firebase.*emulators" "Firebase emulator"
kill_processes "firebase.*serve" "Firebase serve"
kill_processes "java.*firestore" "Firestore emulator"
kill_processes "java.*firebase" "Firebase Java processes"

# Kill any Node.js processes that might be related
kill_processes "node.*firebase" "Node.js Firebase"

# Clean up emulator data directories (optional)
if [ "$1" = "--clean-data" ]; then
    echo "🗑️ Cleaning emulator data..."
    
    # Remove emulator data directories
    rm -rf .firebase/
    rm -rf firebase-debug.log
    rm -rf firestore-debug.log
    rm -rf ui-debug.log
    
    echo "✅ Emulator data cleaned"
fi

# Check for remaining processes
echo "🔍 Checking for remaining Firebase processes..."
remaining=$(ps aux | grep -i firebase | grep -v grep || true)

if [ -n "$remaining" ]; then
    echo "⚠️ Some Firebase-related processes are still running:"
    echo "$remaining"
else
    echo "✅ All Firebase processes cleaned up successfully"
fi

echo "🎉 Cleanup complete!"
echo ""
echo "Usage:"
echo "  ./scripts/cleanup-emulators.sh           # Clean processes only"
echo "  ./scripts/cleanup-emulators.sh --clean-data  # Clean processes and data"