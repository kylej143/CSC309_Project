import prisma from "@/utils/db"
import { verifyToken } from "@/utils/auth";


export default async function handler(req, res) {

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
        return res.status(200).json({message: "this is a user"})

    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}