import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const blogID = Number(req.query.blogID);
    const commentID = Number(req.query.commentID);

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // GET A USER'S RATING FOR A COMMENT
    if (req.method === "GET") {

        try {

            // Ensure user is logged in
            if (!userV) {
                return res.status(401).json({ error: "Please log in" });
            }

            // Check blog associated with comment
            let blogPost = await prisma.blog.findUnique({
                where: {
                    id: blogID,
                    comments: {
                        some: { id: commentID }
                    }
                }
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Cannot find comment" });
            }

            const result = await prisma.commentRating.findUnique({
                where: {
                    userID_commentID: {
                        userID: userV.id,
                        commentID: commentID
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
            return res.status(404).json({ error: "Could not get blog rating" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }

}