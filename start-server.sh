#!/bin/bash
# Local HTTP server for Sanctuary Model (all editions — setup screen on first launch)
cd "$(dirname "$0")"
PORT=8765
URL="http://127.0.0.1:$PORT/unlock.html"

open_browser() {
    sleep 1
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL"
    elif command -v open >/dev/null 2>&1; then
        open "$URL"
    else
        echo "  Open $URL in Chrome or Edge."
    fi
}

echo ""
echo "  TargetProof Sanctuary Model"
echo "  Serving from: $(pwd)"
echo "  Open: $URL"
echo ""
echo "  Keep this window open while using the app."
echo "  Press Ctrl+C to stop the server."
echo ""

if command -v python3 >/dev/null 2>&1; then
    open_browser &
    exec python3 -m http.server "$PORT" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
    open_browser &
    exec python -m http.server "$PORT" --bind 127.0.0.1
else
    echo "  Python not found. Install Python 3, then run this script again."
    open_browser
    read -r -p "Press Enter to close..."
fi