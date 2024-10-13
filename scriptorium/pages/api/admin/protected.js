import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function token_handler(req, res) {
    const Authorization = req.headers.authorization;

    if (!Authorization) {
        return res.status(401).json({
            error: "no token",
        });
    }

    let userV = await verifyToken(Authorization)

    if (!userV) {
        return res.status(401).json({
            error: "invalid token",
        });
    }

    const {userId} = userV
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        return res.status(401).json({
            error: "invalid token",
        });
    }

    const {role} = user
    return role === "ADMIN"
}