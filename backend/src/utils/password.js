import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hash_password = async (plain_password) => {
    return bcrypt.hash(plain_password, SALT_ROUNDS);
};

export const compare_password = async (plain_password, hash) => {
    return bcrypt.compare(plain_password, hash);
};
