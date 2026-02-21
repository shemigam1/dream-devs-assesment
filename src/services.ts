import { prisma } from "./conn";
import { Product, Status } from "./generated/prisma/enums";

class MerchantActivityService {

    public async getTopMerchant() {
        // GET /analytics/top-merchant
        // Returns the merchant with the highest total successful transaction amount across ALL products.
        // Response:{"merchant_id": "MRC-001234", "total_volume": 98765432.10} 
        const result = await prisma.merchantActivity.groupBy({
            by: ["merchantId"],
            where: {
                status: Status.SUCCESS,
            },
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
            take: 1,
        });

        if (!result.length) return null;

        return {
            merchant_id: result[0].merchantId,
            total_volume: parseFloat(result[0]._sum.amount?.toString() ?? "0"),
        };


    }

    public async getMonthlyActiveMerchants() {
        // Returns the count of unique merchants with at least one successful event per month.
        // Response:{"2024-01": 8234, "2024-02": 8456, ... "2024-12": 9102} 

        const result = await prisma.$queryRaw<{ month: string; count: bigint }[]>`
            SELECT
                TO_CHAR("eventTimestamp", 'YYYY-MM') AS month,
                COUNT(DISTINCT "merchantId") AS count
            FROM merchant_activities
            WHERE status = 'SUCCESS'
            GROUP BY month
            ORDER BY month ASC
        `;

        return result.reduce(
            (acc, row) => {
                acc[row.month] = Number(row.count);
                return acc;
            },
            {} as Record<string, number>
        );
    }

    public async getProductAdoption() {
        // Returns unique merchant count per product (sorted by count, highest first).
        // Response:{"POS": 15234, "AIRTIME": 12456, "BILLS": 10234, ...}
        const result = await prisma.merchantActivity.groupBy({
            by: ["product"],
            _count: {
                merchantId: true,
            },
            orderBy: {
                _count: {
                    merchantId: "desc",
                },
            },
        });

        return result.reduce(
            (acc, row) => {
                acc[row.product] = row._count.merchantId;
                return acc;
            },
            {} as Record<string, number>
        );
    }

    public async getKycFunnel() {
        // Returns the KYC conversion funnel (unique merchants at each stage, successful events only).
        // Response:{"documents_submitted": 5432, "verifications_completed": 4521, "tier_upgrades": 3890} 
        const result = await prisma.merchantActivity.groupBy({
            by: ["eventType"],
            where: {
                product: Product.KYC,
                status: Status.SUCCESS,
            },
            _count: {
                merchantId: true,
            },
        });

        const funnel = {
            documents_submitted: 0,
            verifications_completed: 0,
            tier_upgrades: 0,
        };

        const eventTypeMap: Record<string, keyof typeof funnel> = {
            DOCUMENT_SUBMITTED: "documents_submitted",
            VERIFICATION_COMPLETED: "verifications_completed",
            TIER_UPGRADE: "tier_upgrades",
        };

        for (const row of result) {
            const key = eventTypeMap[row.eventType];
            if (key) {
                funnel[key] = row._count.merchantId;
            }
        }

        return funnel;
    }

    public async getFailureRates() {
        // Returns failure rate per product: (FAILED / (SUCCESS + FAILED)) x 100. Exclude PENDING. Sort by rate descending.
        // Response:[{"product": "BILLS", "failure_rate": 5.2}, {"product": "AIRTIME", "failure_rate": 4.1}, ...]
        const stats = await prisma.merchantActivity.groupBy({
            by: ["product", "status"],
            where: {
                status: {
                    in: [Status.SUCCESS, Status.FAILED],
                },
            },
            _count: {
                _all: true,
            },
        });

        const productStats: Record<string, { success: number; failed: number }> = {};

        stats.forEach((row) => {
            if (!productStats[row.product]) {
                productStats[row.product] = { success: 0, failed: 0 };
            }
            if (row.status === Status.SUCCESS) {
                productStats[row.product].success = row._count._all;
            } else if (row.status === Status.FAILED) {
                productStats[row.product].failed = row._count._all;
            }
        });

        const result = Object.entries(productStats).map(([product, counts]) => {
            const total = counts.success + counts.failed;
            const rate = total > 0 ? (counts.failed / total) * 100 : 0;
            return {
                product,
                failure_rate: parseFloat(rate.toFixed(2)),
            };
        });

        return result.sort((a, b) => b.failure_rate - a.failure_rate);
    }
}

const merchantActivityService = new MerchantActivityService()

export default merchantActivityService