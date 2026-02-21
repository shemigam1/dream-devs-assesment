#!/bin/bash

# Test Performance Metrics for Interview Prep
# This script measures actual API performance

echo "==================================="
echo "API Performance Test"
echo "==================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:8080/ > /dev/null 2>&1; then
    echo "❌ Error: Server not running on port 8080"
    echo "Please start the server with: npm start"
    exit 1
fi

echo "✓ Server is running"
echo ""

# Test each endpoint
endpoints=(
    "top-merchant"
    "monthly-active-merchants"
    "product-adoption"
    "kyc-funnel"
    "failure-rates"
)

echo "📊 Testing endpoint response times..."
echo ""

for endpoint in "${endpoints[@]}"; do
    echo "Testing /analytics/$endpoint"

    # Run 3 times and get average
    total=0
    for i in {1..3}; do
        time=$(curl -w "%{time_total}" -s -o /dev/null "http://localhost:8080/analytics/$endpoint")
        total=$(echo "$total + $time" | bc)
    done

    avg=$(echo "scale=3; $total / 3" | bc)
    ms=$(echo "$avg * 1000" | bc)

    printf "  Average response time: %.0f ms\n" $ms
    echo ""
done

echo "==================================="
echo "Database Statistics"
echo "==================================="
echo ""

# Get database stats if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, skipping DB stats"
else
    echo "Getting database statistics..."

    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM merchant_activities;" 2>/dev/null | while read count; do
        echo "Total records: $(echo $count | xargs)"
    done

    psql "$DATABASE_URL" -t -c "SELECT COUNT(DISTINCT merchant_id) FROM merchant_activities;" 2>/dev/null | while read count; do
        echo "Unique merchants: $(echo $count | xargs)"
    done

    psql "$DATABASE_URL" -t -c "SELECT product, COUNT(DISTINCT merchant_id) FROM merchant_activities GROUP BY product ORDER BY count DESC LIMIT 3;" 2>/dev/null | while read line; do
        echo "  $line"
    done
fi

echo ""
echo "==================================="
echo "✅ Performance test complete!"
echo "==================================="
echo ""
echo "Use these numbers in your interview:"
echo "- 'All endpoints respond in under XXX ms'"
echo "- 'Handles X total records with Y unique merchants'"
echo "- 'Most popular product has Z merchants'"
