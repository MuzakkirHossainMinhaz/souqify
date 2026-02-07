import { Request, Response } from 'express';
import { AppError } from '.';

export const errorMiddleware = (err: Error, req: Request, res: Response) => {
    if (err instanceof AppError) {
        console.error(`${req.method} ${req.path} - ${err.message}`);

        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.stack ? { stack: err.stack } : {}),
        });
    }

    console.error(`${req.method} ${req.path} - Unhandled error`);
    console.error(err);

    return res.status(500).json({
        status: 'error',
        message: 'Unhandled error',
        ...(err.stack ? { stack: err.stack } : {}),
    });
};