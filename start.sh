#!/bin/bash
# TargetProof Sanctuary Model — Unix / Linux / macOS launcher
# Double-click START.command on Mac, or run: chmod +x start.sh && ./start.sh
cd "$(dirname "$0")"
chmod +x "$(dirname "$0")/start-server.sh" 2>/dev/null
exec "$(dirname "$0")/start-server.sh"