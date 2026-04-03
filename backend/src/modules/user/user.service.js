import pkg from "../../models/index.cjs";
import { AppError } from "../../utils/app_error.js";

const { User } = pkg;

/**
 * Get current authenticated user
 */
export const get_me_service = async (user_id) => {

    const user = await User.findByPk(user_id, {
        attributes: { exclude: ["password"] }
    });

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
};


/**
 * Get single user (Operator only)
 */
export const get_user_by_id_service = async (id) => {

    const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] }
    });

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
};


/**
 * Get all users (Operator only)
 */
export const get_all_users_service = async () => {

    return User.findAll({
        attributes: { exclude: ["password"] },
        order: [["created_at", "DESC"]]
    });
};


/**
 * Update current user
 */
export const update_me_service = async (user_id, payload) => {

    const user = await User.findByPk(user_id);

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const allowed_fields = ["first_name", "last_name", "phone"];

    Object.keys(payload).forEach(key => {
        if (!allowed_fields.includes(key)) {
            delete payload[key];
        }
    });

    await user.update(payload);

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        updated_at: user.updated_at
    };
};


/**
 * Delete user (Soft delete recommended)
 */
export const delete_user_service = async (id) => {

    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await user.destroy();

    return true;
};