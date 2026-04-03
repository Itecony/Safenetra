import { error_response } from "../utils/response_formatter.js";
import { UniqueConstraintError, ValidationError } from "sequelize";

export const not_found_handler = (req, res) => {
    return error_response(res, {
        status_code: 404,
        message: "Route not found",
        error_code: "NOT_FOUND",
        details: {
            method: req.method,
            path: req.originalUrl
        }
    });
};

export const error_handler = (err, req, res, next) => {
    console.error(err);

    // ✅ Handle Sequelize unique constraint
    if (err instanceof UniqueConstraintError) {
        return error_response(res, {
            status_code: 400,
            message: "Duplicate field value",
            error_code: "UNIQUE_CONSTRAINT_ERROR",
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // ✅ Handle Sequelize validation errors
    if (err instanceof ValidationError) {
        return error_response(res, {
            status_code: 400,
            message: "Validation error",
            error_code: "VALIDATION_ERROR",
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // ✅ Default (AppError or unknown)
    return error_response(res, {
        status_code: err.status_code || 500,
        message: err.message || "Something went wrong",
        error_code: err.code || "INTERNAL_ERROR",
        details: err.details || null
    });
};