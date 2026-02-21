
import "dotenv/config";
import { PrismaClient, Product, Status, Channel, Tier } from "./src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const VALID_PRODUCTS = Object.values(Product);
const VALID_STATUSES = Object.values(Status);
const VALID_CHANNELS = Object.values(Channel);
const VALID_TIERS = Object.values(Tier);
const BATCH_SIZE = 1000;

interface RawCsvRow {
    event_id: string;
    merchant_id: string;
    event_timestamp: string;
    product: string;
    event_type: string;
    amount: string;
    status: string;
    channel: string;
    region: string;
    merchant_tier: string;
}

interface ParsedActivity {
    eventId: string;
    merchantId: string;
    eventTimestamp: Date;
    product: Product;
    eventType: string;
    amount: number;
    status: Status;
    channel: Channel;
    region: string;
    merchantTier: Tier;
}

function isValidRow(row: RawCsvRow): boolean {
    return (
        !!row.event_id &&
        row.merchant_id?.startsWith("MRC-") &&
        !isNaN(Date.parse(row.event_timestamp)) &&
        VALID_PRODUCTS.includes(row.product as Product) &&
        VALID_STATUSES.includes(row.status as Status) &&
        VALID_CHANNELS.includes(row.channel as Channel) &&
        VALID_TIERS.includes(row.merchant_tier as Tier)
    );
}

function parseRow(row: RawCsvRow): ParsedActivity {
    return {
        eventId: row.event_id,
        merchantId: row.merchant_id,
        eventTimestamp: new Date(row.event_timestamp),
        product: row.product as Product,
        eventType: row.event_type,
        amount: parseFloat(row.amount) || 0,
        status: row.status as Status,
        channel: row.channel as Channel,
        region: row.region,
        merchantTier: row.merchant_tier as Tier,
    };
}

async function importFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const rows: ParsedActivity[] = [];
        let skipped = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row: RawCsvRow) => {
                if (isValidRow(row)) {
                    rows.push(parseRow(row));
                } else {
                    skipped++;
                }
            })
            .on("end", async () => {
                try {
                    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                        const batch = rows.slice(i, i + BATCH_SIZE);
                        await prisma.merchantActivity.createMany({
                            data: batch,
                            skipDuplicates: true,
                        });
                    }

                    console.log(
                        `✓ ${path.basename(filePath)} — imported: ${rows.length}, skipped: ${skipped}`
                    );
                    resolve();
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", reject);
    });
}

async function main(): Promise<void> {
    const dataDir = process.env.DATA_DIR ?? "./data";

    const files = fs
        .readdirSync(dataDir)
        .filter((f) => f.startsWith("activities_") && f.endsWith(".csv"))
        .sort();

    if (files.length === 0) {
        console.log("No CSV files found in", dataDir);
        return;
    }

    console.log(`Found ${files.length} files. Starting import...`);

    for (const file of files) {
        await importFile(path.join(dataDir, file));
    }

    const total = await prisma.merchantActivity.count();
    console.log(`\nDone. Total records in DB: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());