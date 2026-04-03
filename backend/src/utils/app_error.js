export class AppError extends Error {
    constructor(
        message,
        status_code = 500,
        code = "INTERNAL_ERROR",
        details = null
    ) {
        super(message);
        this.status_code = status_code;
        this.code = code;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}
