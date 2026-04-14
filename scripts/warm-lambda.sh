#!/bin/bash
# warm-lambda.sh — Pre-demo Lambda warming
# Usage: bash scripts/warm-lambda.sh [API_URL]
# Run this ~5 minutes before a demo to avoid cold start latency

set -e

STAGE="${STAGE:-dev}"

if [ -n "$1" ]; then
  API_URL="$1"
else
  echo "Looking up API URL from SST output..."
  API_URL=$(pnpm sst output --stage "$STAGE" --json 2>/dev/null | jq -r '.apiUrl // empty' || true)
fi

if [ -z "$API_URL" ]; then
  echo "❌ Could not determine API URL."
  echo "   Pass it as an argument: bash scripts/warm-lambda.sh https://your-url.lambda-url.us-east-1.on.aws/"
  exit 1
fi

# Strip trailing slash if present
API_URL="${API_URL%/}"

echo "Warming Lambda at: $API_URL"
echo ""

# Ping health endpoint 3 times to ensure warm container
for i in 1 2 3; do
  echo "Ping $i/3..."
  RESULT=$(curl -sf "${API_URL}/api/health" 2>/dev/null || echo '{"status":"error"}')
  STATUS=$(echo "$RESULT" | jq -r '.status // "error"' 2>/dev/null || echo "error")
  
  if [ "$STATUS" = "ok" ]; then
    echo "  ✅ Health: OK"
  else
    echo "  ⚠️  Health check returned: $RESULT"
  fi
  
  sleep 2
done

echo ""
echo "Lambda warmed at $(date)"
echo "Lambda is ready for the demo! 🚀"
