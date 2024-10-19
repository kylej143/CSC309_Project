import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function token_handler(req, res) {
    const Authorization = req.headers.authorization;

    if (!Authorization) {
        return false
    }

    let userV = await verifyToken(Authorization)

    if (!userV) {
        return false
    }

    const {username} = userV

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
    })
    return user
}