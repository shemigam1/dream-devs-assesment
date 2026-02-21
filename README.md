# Moniepoint Analytics API

A REST API for analyzing merchant activity data across Moniepoint's product ecosystem.

## Author
Oluwasemilore Omotade-Michaels

## Overview

This API processes merchant activity logs from CSV files and exposes business insights through 5 analytics endpoints. The system handles transactions across multiple products: POS, Airtime, Bills, Card Payments, Savings, MonieBook, and KYC verification.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **CSV Processing:** csv-parser

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd dream-devs-assesment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/moniepoint_analytics"
DATA_DIR="./data"
API_ROUTE="/analytics"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 5. Import CSV data

Place your CSV files in the `./data` directory with the naming convention:
- `activities_YYYYMMDD.csv`

Then run the import script:

```bash
tsx import-csv.ts
```

### 6. Start the server

```bash
npm start
```

The API will be available at `http://localhost:8080`


### 1. GET /analytics/top-merchant

Returns the merchant with the highest total successful transaction amount across all products.

**Response:**
```json
{
  "merchant_id": "MRC-001234",
  "total_volume": 98765432.10
}
```

### 2. GET /analytics/monthly-active-merchants

Returns the count of unique merchants with at least one successful event per month.

**Response:**
```json
{
  "2024-01": 8234,
  "2024-02": 8456,
  "2024-03": 8789,
  ...
  "2024-12": 9102
}
```

### 3. GET /analytics/product-adoption

Returns unique merchant count per product, sorted by count (highest first).

**Response:**
```json
{
  "POS": 15234,
  "AIRTIME": 12456,
  "BILLS": 10234,
  "CARD_PAYMENT": 8901,
  "SAVINGS": 7654,
  "MONIEBOOK": 5432,
  "KYC": 4321
}
```

### 4. GET /analytics/kyc-funnel

Returns the KYC conversion funnel showing unique merchants at each stage (successful events only).

**Response:**
```json
{
  "documents_submitted": 5432,
  "verifications_completed": 4521,
  "tier_upgrades": 3890
}
```

### 5. GET /analytics/failure-rates

Returns failure rate per product, calculated as `(FAILED / (SUCCESS + FAILED)) × 100`. Excludes PENDING status. Sorted by rate descending.

**Response:**
```json
[
  { "product": "BILLS", "failure_rate": 5.2 },
  { "product": "AIRTIME", "failure_rate": 4.1 },
  { "product": "CARD_PAYMENT", "failure_rate": 3.8 },
  { "product": "POS", "failure_rate": 2.1 },
  { "product": "SAVINGS", "failure_rate": 1.5 },
  { "product": "MONIEBOOK", "failure_rate": 0.9 },
  { "product": "KYC", "failure_rate": 0.3 }
]
```

## Data Schema

### CSV Input Format

| Field | Type | Description |
|-------|------|-------------|
| event_id | UUID | Unique event identifier |
| merchant_id | VARCHAR | Merchant identifier (format: MRC-XXXXXX) |
| event_timestamp | TIMESTAMP | Event occurrence time (ISO 8601) |
| product | VARCHAR | Product category |
| event_type | VARCHAR | Type of activity |
| amount | DECIMAL | Transaction amount in NGN (0 for non-monetary) |
| status | VARCHAR | SUCCESS, FAILED, or PENDING |
| channel | VARCHAR | POS, APP, USSD, WEB, or OFFLINE |
| region | VARCHAR | Merchant's operating region |
| merchant_tier | VARCHAR | STARTER, VERIFIED, or PREMIUM |

### Products

- **POS:** Terminal card transactions
- **AIRTIME:** Airtime vending
- **BILLS:** Bill payments (electricity, cable, internet, etc.)
- **CARD_PAYMENT:** Merchant's card payments to suppliers
- **SAVINGS:** Savings account operations
- **MONIEBOOK:** Inventory and sales tracking
- **KYC:** Verification and tier upgrades

## Database Schema

The application uses a single table `merchant_activities` with the following indexes for optimal performance:

- `merchantId` (single column)
- `product` (single column)
- `status` (single column)
- `eventTimestamp` (single column)
- `(merchantId, status)` (composite)
- `(product, status)` (composite)
- `(eventTimestamp, status)` (composite)

## Assumptions & Design Decisions

### Data Handling

1. **Malformed Data:** Records that fail validation are skipped during import and logged. Validation checks:
   - Valid UUID for event_id
   - merchant_id starts with "MRC-"
   - Valid timestamp format
   - Valid enum values for product, status, channel, and tier
   - Numeric amount (defaults to 0 if invalid)

2. **Duplicate Records:** The import process uses `skipDuplicates: true` to prevent duplicate event_id entries.

3. **"Active Merchant":** A merchant is considered active in a month if they have at least one SUCCESS event in that month.

4. **"Top Merchant":** Determined by the sum of all successful transaction amounts across all products.

5. **"Product Adoption":** Counts unique merchants who have used each product at least once (regardless of status).

6. **"KYC Funnel":** Only counts successful KYC events. Each stage counts unique merchants who reached that stage.

7. **"Failure Rate":** PENDING transactions are excluded from calculations as they are neither successes nor failures.

### Performance Optimizations

1. **Batch Imports:** CSV records are imported in batches of 1000 to optimize memory usage and database performance.

2. **Database Indexes:** Strategic indexes are placed on frequently queried columns to ensure fast response times.

3. **Raw SQL Queries:** For complex aggregations requiring `COUNT(DISTINCT)`, raw SQL queries are used instead of Prisma's groupBy to ensure correctness and performance.

### API Design

1. **Response Format:** All endpoints return data directly as JSON objects/arrays. Error responses follow the format: `{"error": "error message"}`.

2. **HTTP Status Codes:**
   - 200: Successful request
   - 500: Internal server error

3. **Port:** The API runs strictly on port 8080 as per specification.

4. **CORS:** Cross-Origin Resource Sharing is enabled for all origins.


## Testing

To test the API endpoints, you can use curl, Postman, or any HTTP client:

```bash
# Test top merchant
curl http://localhost:8080/analytics/top-merchant

# Test monthly active merchants
curl http://localhost:8080/analytics/monthly-active-merchants

# Test product adoption
curl http://localhost:8080/analytics/product-adoption

# Test KYC funnel
curl http://localhost:8080/analytics/kyc-funnel

# Test failure rates
curl http://localhost:8080/analytics/failure-rates
```

## Known Limitations

1. **No Pagination:** Endpoints return all results. For production use with very large datasets, pagination should be implemented.

2. **No Authentication:** The API is currently open. Production deployment should add authentication/authorization.

3. **No Rate Limiting:** Consider adding rate limiting for production deployments.

4. **No Caching:** Results are computed on every request. Consider implementing caching for frequently accessed data.

## Troubleshooting

### Import Issues

If CSV import fails:
- Verify CSV files are in the correct directory (`./data`)
- Check file naming convention: `activities_YYYYMMDD.csv`
- Ensure database connection is working
- Check logs for specific validation errors

### Database Connection Issues

- Verify DATABASE_URL in `.env` is correct
- Ensure PostgreSQL is running
- Check database user has proper permissions
- Verify database exists

### API Not Starting

- Check if port 8080 is already in use
- Verify all dependencies are installed (`npm install`)
- Ensure Prisma client is generated (`npx prisma generate`)
- Check database migrations are up to date





