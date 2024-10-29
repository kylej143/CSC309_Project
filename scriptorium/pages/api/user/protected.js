import prisma from "@/utils/db"
import {verifyToken} from "@/utils/auth";


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
        return await prisma.user.findUnique({
            where: {
                username: username,
            },
        })
    }
    catch (error) {
        return false
    }


}