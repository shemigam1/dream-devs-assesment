import { NextFunction, Request, Response } from "express";
import merchantActivityService from "./services";

export async function getTopMerchant(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getTopMerchant()
        return res.status(200).json({
            error: false,
            message: "Top merchant fetched successfully",
            status: 200,
            data: result
        })
    } catch (error) {
        console.error("getTopMerchant error:", error);
        return res.status(422).json({
            error: true,
            message: "Something went wrong processing top merchant",
            status: 422,
            data: null
        })
    }
}

export async function getMonthlyActiveMerchants(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getMonthlyActiveMerchants()
        return res.status(200).json({
            error: false,
            message: "Monthly active merchants fetched successfully",
            status: 200,
            data: result
        })
    } catch (error) {
        console.error("getMonthlyActiveMerchants error:", error);
        return res.status(422).json({
            error: true,
            message: "Something went wrong processing monthly active merchants",
            status: 422,
            data: null
        })
    }
}

export async function getProductAdoption(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getProductAdoption()
        return res.status(200).json({
            error: false,
            message: "Product adoption fetched successfully",
            status: 200,
            data: result
        })
    } catch (error) {
        console.error("getProductAdoption error:", error);
        return res.status(422).json({
            error: true,
            message: "Something went wrong processing product adoption",
            status: 422,
            data: null
        })
    }
}

export async function getKycFunnel(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getKycFunnel()
        return res.status(200).json({
            error: false,
            message: "KYC funnel fetched successfully",
            status: 200,
            data: result
        })
    } catch (error) {
        console.error("getKycFunnel error:", error);
        return res.status(422).json({
            error: true,
            message: "Something went wrong processing kyc funnel",
            status: 422,
            data: null
        })
    }
}

export async function getFailureRates(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await merchantActivityService.getFailureRates()
        return res.status(200).json({
            error: false,
            message: "Failure rates fetched successfully",
            status: 200,
            data: result
        })
    } catch (error) {
        console.error("getFailureRates error:", error);
        return res.status(422).json({
            error: true,
            message: "Something went wrong processing failure rates",
            status: 422,
            data: null
        })
    }
}
