import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function token_handler(req, res) {
    const Authorization = req.headers.authorization;

    let userV = token_handler(req, res)
    if (!userV) {
        return res.status(403).json({error: "403 Forbidden"})
    }

    if (!Authorization) {
        return false
    }

    userV = await verifyToken(Authorization)

    if (!userV) {
        return false
    }

    const {userId} = userV

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })
    return user
}