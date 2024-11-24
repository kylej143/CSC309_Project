import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected.js';
import admin_token_handler from '@/pages/api/admin/protected';
const prisma = new PrismaClient();


export default async function handler(req, res) {

    const userV = await token_handler(req, res);
    const adminV = await admin_token_handler(req, res);

    // GET ALL TAGS ASSOCIATED WITH BLOGS
    if (req.method === "GET") {

        try {
            const result = await prisma.tag.findMany({
                where: {
                    NOT: {
                        blogs: {
                            none: { id: undefined }
                        }
                    }
                },
                orderBy: {
                    tag: 'asc',
                }
            });
            return res.status(200).json(result);
        }

        catch (error) {
            return res.status(403).json({ error: "Could not get tags" });
        }

    }

    else {
        return res.status(403).json({ error: "Method not allowed" });
    }



}