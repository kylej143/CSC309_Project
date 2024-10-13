import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function token_handler(req, res) {

    if (req.method === "GET") {
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
        if (role === "ADMIN") {
            return res.status(200).json({message: "this is an admin"})
        }
        else {
            return res.status(403).json({error: "403 Forbidden"})
        }


    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}