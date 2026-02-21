-- CreateEnum
CREATE TYPE "Product" AS ENUM ('POS', 'AIRTIME', 'BILLS', 'CARD_PAYMENT', 'SAVINGS', 'MONIEBOOK', 'KYC');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('POS', 'APP', 'USSD', 'WEB', 'OFFLINE');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('STARTER', 'VERIFIED', 'PREMIUM');

-- CreateTable
CREATE TABLE "merchant_activities" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "merchantId" VARCHAR(20) NOT NULL,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "product" "Product" NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL,
    "channel" "Channel" NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "merchantTier" "Tier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_activities_eventId_key" ON "merchant_activities"("eventId");

-- CreateIndex
CREATE INDEX "merchant_activities_merchantId_idx" ON "merchant_activities"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_activities_product_idx" ON "merchant_activities"("product");

-- CreateIndex
CREATE INDEX "merchant_activities_status_idx" ON "merchant_activities"("status");

-- CreateIndex
CREATE INDEX "merchant_activities_eventTimestamp_idx" ON "merchant_activities"("eventTimestamp");

-- CreateIndex
CREATE INDEX "merchant_activities_merchantId_status_idx" ON "merchant_activities"("merchantId", "status");

-- CreateIndex
CREATE INDEX "merchant_activities_product_status_idx" ON "merchant_activities"("product", "status");

-- CreateIndex
CREATE INDEX "merchant_activities_eventTimestamp_status_idx" ON "merchant_activities"("eventTimestamp", "status");
