export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public override readonly message: string;
    public override readonly stack: string;

    constructor(message: string, statusCode: number, isOperational = true, stack = '') {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.stack = stack;
        Error.captureStackTrace(this);
    }
}

// 400 - Bad Request / Validation Error
export class BadRequestError extends AppError {
    constructor(message = 'Bad request', name = 'BadRequestError') {
        super(message, 400);
        this.name = name;
    }

    static validationError(message = 'Validation error') {
        return new BadRequestError(message, 'ValidationError');
    }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

// 404 - Not Found
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

// 409 - Conflict
export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

// 429 - Too Many Requests
export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}

// 500 - Internal Server Error (handles all 500 errors)
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }

    static databaseError(message = 'Database error') {
        return new InternalServerError(message);
    }
}

