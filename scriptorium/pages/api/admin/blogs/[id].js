import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const adminV = await token_handler(req, res);

    let { id } = req.query;
    id = Number(id);

    // HIDE/UNHIDE BLOG
    if (req.method === "PUT") {

        const { hide } = req.body;

        // Ensure admin is logged in
        if (!adminV[0]) {
            res.status(401).json({ error: "Permission denied" });
        }

        // hide blog
        try {
            const hideBool = (hide === true);

            let updatedPost = await prisma.blog.findUnique({
                where: {
                    id,
                }
            });

            if (!updatedPost) {
                return res.status(404).json({ error: "Blog post does not exist" });
            }

            await prisma.blog.update({
                where: {
                    id
                },
                data: {
                    hide: hideBool,
                }
            })
            if (hideBool) {
                return res.status(200).json({ "message": "Successfully hid blog" });
            }
            else {
                return res.status(200).json({ "message": "Blog unhidden" });
            }
        }
        catch (error) {
            return res.status(403).json({ error: "Could not hide blog" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }


}