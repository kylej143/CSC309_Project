import prisma from "@/utils/db"


export default async function handler(req, res) {

    if (req.method === "GET") {
        const {username} = req.body

        try {
            const userV = await prisma.user.findUnique({
                where: {
                    username: username,
                },
            })

            return res.status(200).json({"username" : userV.username,
                "name": userV.name,
                "email": userV.email,
                "avatar": userV.avatar,
                "phoneNumber": userV.phoneNumber,})
        }
        catch (error) {
            return res.status(400).json({error: "username not found"})
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }


}