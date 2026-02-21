import { NextFunction, Request, Response } from "express";
import merchantActivityService from "./services";

export async function getTopMerchant(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getTopMerchant()
        return res.status(200).json(result)
    } catch (error) {
        console.error("getTopMerchant error:", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export async function getMonthlyActiveMerchants(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getMonthlyActiveMerchants()
        return res.status(200).json(result)
    } catch (error) {
        console.error("getMonthlyActiveMerchants error:", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export async function getProductAdoption(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getProductAdoption()
        return res.status(200).json(result)
    } catch (error) {
        console.error("getProductAdoption error:", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export async function getKycFunnel(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getKycFunnel()
        return res.status(200).json(result)
    } catch (error) {
        console.error("getKycFunnel error:", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export async function getFailureRates(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getFailureRates()
        return res.status(200).json(result)
    } catch (error) {
        console.error("getFailureRates error:", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}
