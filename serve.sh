#!/usr/bin/env bash
# Serve the pamphlet site at http://localhost:8080 and open it in the browser.
#
# Why this exists: YouTube embeds refuse to play on pages opened via file://
# ("Error 153") because no HTTP referrer is sent. Serving over localhost fixes it.
#
# Usage:  ./serve.sh            (port 8080)
#         ./serve.sh 3000       (custom port)
cd "$(dirname "$0")"
PORT="${1:-8080}"
( sleep 1; wslview "http://localhost:$PORT" 2>/dev/null || explorer.exe "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null ) &
exec python3 -m http.server "$PORT"
