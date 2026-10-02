import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('[Internal Error Log]:', err?.stack || err?.message || err);

    const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
    const clientMessage = statusCode === 500
        ? 'A generic internal application error occurred.'
        : err?.message || 'An error occurred.';

    const payload: Record<string, unknown> = {
        error: clientMessage,
    };

    if (process.env.NODE_ENV === 'development') {
        payload.stack = err?.stack;
    }

    res.status(statusCode).json(payload);
};
