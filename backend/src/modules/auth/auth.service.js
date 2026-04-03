import pkg from "../../models/index.cjs";
import { AppError } from "../../utils/app_error.js";
import { hash_password, compare_password } from "../../utils/password.js";
import { sign_token } from "../../utils/jwt.js";

const { User, UserDevice, sequelize } = pkg;

export const register_user_service = async (payload) => {
    const { first_name, last_name, email, phone, password } = payload;

    const existing = await User.findOne({
        where: { email }
    });

    if (existing) {
        throw new AppError(
            "User already exists",
            400,
            "USER_ALREADY_EXISTS"
        );
    }

    const password_hash = await hash_password(password);

    const user = await User.create({
        first_name,
        last_name,
        email,
        phone,
        password: password_hash,
        role: "USER"
    });

    //exclude password hash from returned user object
    const new_user = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    }
    return new_user;
};

export const login_user_service = async (payload) => {
    const { email, password, device } = payload;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError(
            "Invalid credentials",
            401,
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    const is_match = await compare_password(password, user.password);

    if (!is_match) {
        throw new AppError(
            "Invalid credentials",
            401,
            "AUTH_INVALID_CREDENTIALS"
        );
    }

    const transaction = await sequelize.transaction();

    try {

        if (device && device.installId) {

            const existingDevice = await UserDevice.findOne({
                where: {
                    user_id: user.id,
                    install_id: device.installId
                },
                transaction
            });

            if (existingDevice) {

                // Re-login → Update metadata only
                await existingDevice.update({
                    platform: device.platform,
                    app_package_name: device.app?.packageName,
                    app_version: device.app?.version,
                    build_number: device.app?.buildNumber,
                    network_type: device.network?.type,
                    network_isp: device.network?.isp,
                    manufacturer: device.device?.manufacturer,
                    brand: device.device?.brand,
                    model: device.device?.model,
                    device_identifier: device.device?.device,
                    product: device.device?.product,
                    os_version: device.os?.version,
                    sdk_int: device.os?.sdkInt,
                    security_patch: device.os?.securityPatch,
                    is_physical_device: device.runtime?.isPhysicalDevice,
                    locale: device.locale,
                    timezone: device.timezone,
                    last_login_at: new Date()
                }, { transaction });

            } else {

                // First time login on this device
                await UserDevice.create({
                    user_id: user.id,
                    install_id: device.installId,
                    platform: device.platform,
                    app_package_name: device.app?.packageName,
                    app_version: device.app?.version,
                    build_number: device.app?.buildNumber,
                    network_type: device.network?.type,
                    network_isp: device.network?.isp,
                    manufacturer: device.device?.manufacturer,
                    brand: device.device?.brand,
                    model: device.device?.model,
                    device_identifier: device.device?.device,
                    product: device.device?.product,
                    os_version: device.os?.version,
                    sdk_int: device.os?.sdkInt,
                    security_patch: device.os?.securityPatch,
                    is_physical_device: device.runtime?.isPhysicalDevice,
                    locale: device.locale,
                    timezone: device.timezone,
                    first_login_at: new Date(),
                    last_login_at: new Date()
                }, { transaction });

            }
        }

        const token = sign_token({
            id: user.id,
            role: user.role
        });

        const user_details = {
            id: user.id,
            first_name: user.first_name,
            role: user.role
        };
        await transaction.commit();

        return { token, user: user_details };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
