import prisma from "@/utils/db"
import {comparePassword, generateRefreshToken, generateToken} from "@/utils/auth";


export default async function handler(req, res) {
    if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "not all fields provided",
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });

    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({
            error: "Invalid credentials",
        });
    }

    const token = generateToken({ userId: user.id, username: user.username });
    const refreshToken = generateRefreshToken( { userId: user.id, username: user.username })
    return res.status(200).json({
        "accessToken": token, "refreshToken": refreshToken,
    });
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}