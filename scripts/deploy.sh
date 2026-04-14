#!/bin/bash
set -e

export AWS_PROFILE="${AWS_PROFILE:-elt-dev}"
STAGE="${1:-production}"

echo "=== ELT Deploy Script ==="
echo "Stage: $STAGE"
echo "AWS Profile: $AWS_PROFILE"
echo ""

# Verify Anthropic key is set
echo "Verifying SST secrets..."
if ! pnpm sst secret list --stage "$STAGE" 2>/dev/null | grep -q "AnthropicApiKey"; then
  echo "⚠️  AnthropicApiKey secret not set."
  echo "   Run: npx sst secret set AnthropicApiKey sk-ant-... --stage $STAGE"
  exit 1
fi

# Build all packages first
echo "Building packages..."
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test

# Deploy via SST
echo ""
echo "Deploying to AWS via SST..."
pnpm sst deploy --stage "$STAGE"

# Extract outputs
echo ""
echo "Extracting deployment outputs..."
SST_OUTPUT=$(pnpm sst output --stage "$STAGE" --json 2>/dev/null || echo "{}")

API_URL=$(echo "$SST_OUTPUT" | jq -r '.apiUrl // empty' || true)
WEB_URL=$(echo "$SST_OUTPUT" | jq -r '.webUrl // empty' || true)

if [ -z "$API_URL" ]; then
  echo "⚠️  Could not auto-detect API URL from SST output. Check the SST console."
  exit 1
fi

echo "API URL: $API_URL"
echo "Web URL: ${WEB_URL:-N/A}"

# Verify /api/health
echo ""
echo "Verifying /api/health..."
HEALTH=$(curl -sf "${API_URL}api/health" || curl -sf "${API_URL}/api/health" || echo "{}")
echo "Response: $HEALTH"
echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null || (echo "❌ /api/health check failed" && exit 1)

# Verify /api/products
echo "Verifying /api/products..."
PRODUCTS=$(curl -sf "${API_URL}api/products" || curl -sf "${API_URL}/api/products" || echo "[]")
CARD_COUNT=$(echo "$PRODUCTS" | jq 'length' 2>/dev/null || echo "0")
echo "Products returned: $CARD_COUNT cards"

# Warm the Lambda
echo ""
echo "Warming Lambda..."
bash "$(dirname "$0")/warm-lambda.sh" "$API_URL"

echo ""
echo "✅ Deploy complete!"
echo "  API:  $API_URL"
echo "  Web:  ${WEB_URL:-N/A}"
echo ""
echo "Pre-demo checklist:"
echo "  1. Run: bash scripts/warm-lambda.sh $API_URL  (5 min before demo)"
echo "  2. Open: $WEB_URL"
echo "  3. Send a test message to verify streaming works"
