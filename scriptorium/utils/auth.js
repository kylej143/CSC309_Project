import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = 10
const JWT_SECRET = "asdlfjqif;ql;k1212j1456hjk"
const REFRESH_SECRET = "asjd;asasadsal;dfj;asqadsasd"
const JWT_EXPIRES_IN = "20m"
const JWT_REFRESH_EXPIRES_IN = "10h"

export async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

export function generateToken(obj) {
    return jwt.sign(obj, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function generateRefreshToken(obj) {
    return jwt.sign(obj, REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
}

export function verifyToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }

    token = token.split(" ")[1];

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export function verifyRefreshToken(token) {
    if (!token) {
        return null;
    }

    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
        return null;
    }
}