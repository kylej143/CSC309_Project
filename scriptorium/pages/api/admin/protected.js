import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function token_handler(req) {
    const Authorization = req.headers.authorization;

    if (!Authorization) {
        return false
    }

    let userV = await verifyToken(Authorization)

    if (!userV) {
        return false
    }

    const {username} = userV

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            return false
        }

        const {role} = user
        return [role === "ADMIN", user]
    }
    catch (error) {
        return false
    }

}