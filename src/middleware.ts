import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let message = 'Oops, something went wrong. Please try again later';
    let errCode = 422;

    console.log('error handler: ', err.message);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // handle prisma known request errors
        if (err.code === 'P2002') {
            // unique constraint violation
            const target = (err.meta?.target as string[]) || [];
            const field = target.join(', ');
            message = `An account with this ${field} already exists! Please use another one.`;
            errCode = 400;
        } else if (err.code === 'P2025') {
            // record not found
            message = 'Record not found.';
            errCode = 404;
        } else {
            message = err.message;
            errCode = 400;
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        // handle prisma validation errors
        message = 'Invalid input data. Please check your request.';
        errCode = 400;
    }
    else if (err instanceof Error) {
        //handle generic errors
        message = err.message;
        errCode = 422;
    } else if (
        err instanceof SyntaxError ||
        err instanceof EvalError ||
        err instanceof RangeError ||
        err instanceof ReferenceError ||
        err instanceof TypeError ||
        err instanceof URIError
    ) {
        //handle global error types
        message = err.message;
        errCode = 400;
    }

    console.error(
        `[${req.method} ${req.url}] ${typeof message === 'string' ? message : JSON.stringify(message)
        }`
    );

    const response = {
        error: false,
        message,
        status: errCode,
        data: null
    };
    res.status(errCode).json(response);
};

export default errorHandler;
