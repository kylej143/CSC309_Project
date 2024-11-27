import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    let { blogID } = req.query;
    let id = Number(blogID);

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // GET A USER'S RATING FOR A BLOG POST
    if (req.method === "GET") {

        try {

            // Ensure user is logged in
            if (!userV) {
                return res.status(401).json({ error: "Please log in" });
            }

            const result = await prisma.blogRating.findUnique({
                where: {
                    userID_blogID: {
                        userID: userV.id,
                        blogID: id
                    }
                },
            })

            if (result) {
                return res.status(200).json(result);
            }
            else {
                return res.status(403).json({ error: "Could not get blog rating" });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(404).json({ error: "Could not get blog rating" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }

}