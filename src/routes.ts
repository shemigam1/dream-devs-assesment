import { Router } from "express";
import { getFailureRates, getKycFunnel, getMonthlyActiveMerchants, getProductAdoption, getTopMerchant } from "./controllers";

const apiRouter = Router();

apiRouter.get("/top-merchant", getTopMerchant);

apiRouter.get("/monthly-active-merchants", getMonthlyActiveMerchants);

apiRouter.get("/product-adoption", getProductAdoption);

apiRouter.get("/kyc-funnel", getKycFunnel);

apiRouter.get("/failure-rates", getFailureRates);


export default apiRouter;

// GET /analytics/top-merchant
// Returns the merchant with the highest total successful transaction amount across ALL products.
// Response:{"merchant_id": "MRC-001234", "total_volume": 98765432.10} 
// GET /analytics/monthly-active-merchants
// Returns the count of unique merchants with at least one successful event per month.
// Response:{"2024-01": 8234, "2024-02": 8456, ... "2024-12": 9102} 
// GET /analytics/product-adoption
// Returns unique merchant count per product (sorted by count, highest first).
// Response:{"POS": 15234, "AIRTIME": 12456, "BILLS": 10234, ...} 
// GET /analytics/kyc-funnel
// Returns the KYC conversion funnel (unique merchants at each stage, successful events only).
// Response:{"documents_submitted": 5432, "verifications_completed": 4521, "tier_upgrades": 3890} 
// GET /analytics/failure-rates
// Returns failure rate per product: (FAILED / (SUCCESS + FAILED)) x 100. Exclude PENDING. Sort by rate descending.
// Response:[{"product": "BILLS", "failure_rate": 5.2}, {"product": "AIRTIME", "failure_rate": 4.1}, ...] 