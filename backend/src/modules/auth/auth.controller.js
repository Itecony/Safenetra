import { async_handler } from "../../utils/async_handler.js";
import { success_response } from "../../utils/response_formatter.js";
import {
    register_user_service,
    login_user_service
} from "./auth.service.js";

export const register = async_handler(async (req, res) => {
    const user = await register_user_service(req.body);

    return success_response(res, {
        status_code: 201,
        message: "User registered successfully",
        data: user
    });
});

export const login = async_handler(async (req, res) => {
    const result = await login_user_service(req.body);

    return success_response(res, {
        message: "Login successful",
        data: result
    });
});
