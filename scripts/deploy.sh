#!/bin/bash
set -e

export AWS_PROFILE=elt-dev

echo "=== ELT Deploy Script ==="
echo "Deploying to AWS account 108405836063 (elt-dev)..."

# Deploy via SST
pnpm sst deploy --stage production

# Extract the API URL
API_URL=$(pnpm sst output --stage production --json 2>/dev/null | jq -r '.apiUrl // empty' || true)

if [ -z "$API_URL" ]; then
  echo "⚠️  Could not auto-detect API URL from SST output. Check the SST console."
  exit 1
fi

echo "API URL: $API_URL"

# Verify /hello
echo "Verifying /hello..."
HELLO=$(curl -sf "${API_URL}hello")
echo "Response: $HELLO"
echo "$HELLO" | jq -e '.message == "Hello from ELT!"' > /dev/null || (echo "❌ /hello check failed" && exit 1)

# Verify /health
echo "Verifying /health..."
HEALTH=$(curl -sf "${API_URL}health")
echo "Response: $HEALTH"
echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null || (echo "❌ /health check failed" && exit 1)

echo "✅ Deploy verified! API is live at: $API_URL"
