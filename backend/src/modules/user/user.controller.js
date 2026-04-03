import { async_handler } from "../../utils/async_handler.js";
import { success_response } from "../../utils/response_formatter.js";
import {
    get_me_service,
    get_user_by_id_service,
    get_all_users_service,
    update_me_service,
    delete_user_service
} from "./user.service.js";


export const get_me = async_handler(async (req, res) => {

    const user = await get_me_service(req.user.id);

    return success_response(res, {
        message: "User profile fetched successfully",
        data: user
    });
});


export const get_user_by_id = async_handler(async (req, res) => {

    const user = await get_user_by_id_service(req.params.id);

    return success_response(res, {
        message: "User fetched successfully",
        data: user
    });
});


export const get_all_users = async_handler(async (req, res) => {

    const users = await get_all_users_service();

    return success_response(res, {
        message: "Users fetched successfully",
        data: users
    });
});


export const update_me = async_handler(async (req, res) => {

    const user = await update_me_service(req.user.id, req.body);

    return success_response(res, {
        message: "User updated successfully",
        data: user
    });
});


export const delete_user = async_handler(async (req, res) => {

    await delete_user_service(req.params.id);

    return success_response(res, {
        message: "User deleted successfully"
    });
});