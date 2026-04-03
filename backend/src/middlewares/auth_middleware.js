import { verify_token } from "../utils/jwt.js";
import { AppError } from "../utils/app_error.js";

export const authenticate = (req, res, next) => {
    const auth_header = req.headers.authorization;

    if (!auth_header || !auth_header.startsWith("Bearer ")) {
        throw new AppError(
            "Unauthorized",
            401,
            "AUTH_UNAUTHORIZED"
        );
    }

    const token = auth_header.split(" ")[1];

    try {
        const decoded = verify_token(token);
        req.user = decoded;
        next();
    } catch {
        throw new AppError(
            "Invalid or expired token",
            401,
            "AUTH_TOKEN_INVALID"
        );
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new AppError("Forbidden", 403, "FORBIDDEN");
        }
        next();
    };
};