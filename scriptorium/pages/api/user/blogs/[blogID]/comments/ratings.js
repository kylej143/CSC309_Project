import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const blogID = Number(req.query.blogID);

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // GET A USER'S RATING FOR A COMMENT
    if (req.method === "GET") {

        try {

            // Ensure user is logged in
            if (!userV) {
                return res.status(401).json({ error: "Please log in" });
            }

            const blogExists = await prisma.blog.findUnique({
                where: {
                    id: blogID
                }
            })

            if (!blogExists) {
                return res.status(404).json({ error: "Blog post does not exist" });
            }


            const result = await prisma.commentRating.findMany({
                where: {
                    userID: userV.id,
                    comment: {
                        blogID: blogID,
                    }
                },
            })

            if (result) {
                return res.status(200).json(result);
            }
            else {
                return res.status(403).json({ error: "Could not get comment ratings" });
            }
        }
        catch (error) {
            console.log(error)
            return res.status(404).json({ error: "Could not get comment ratings" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }

}