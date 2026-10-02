import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('[Internal Error Log]:', err?.stack || err?.message || err);

    const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';
    const payload: Record<string, unknown> = {
        error: statusCode >= 500 && process.env.NODE_ENV !== 'development'
            ? 'Internal server error'
            : message,
    };

    if (process.env.NODE_ENV === 'development') {
        payload.stack = err?.stack;
    }

    res.status(statusCode).json(payload);
};
