#!/bin/bash
cd "$(dirname "$0")"
chmod +x "$(dirname "$0")/start.sh" "$(dirname "$0")/start-server.sh" 2>/dev/null
exec "$(dirname "$0")/start.sh"