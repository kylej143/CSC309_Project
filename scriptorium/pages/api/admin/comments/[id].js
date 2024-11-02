import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const adminV = await token_handler(req, res);

    let { id } = req.query;
    id = Number(id);

    // HIDE/UNHIDE COMMENT
    if (req.method === "PUT") {

        const { hide } = req.body;

        // Ensure admin is logged in
        if (!adminV) {
            res.status(400).json({ "error": "Permission denied" });
        }
        console.log(adminV)

        try {

            // hide comment
            const hideBool = (hide === true);

            let updatedComment = await prisma.comment.findUnique({
                where: {
                    id,
                }
            });

            if (!updatedComment) {
                return res.status(400).json({ "error": "Comment does not exist" });
            }

            await prisma.comment.update({
                where: {
                    id
                },
                data: {
                    hide: hideBool,
                }
            })
            if (hideBool) {
                return res.status(200).json({ "message": "Successfully hid comment" });
            }
            else {
                return res.status(200).json({ "message": "Comment unhidden" });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ "message": "Could not hide comment" });
        }

    }


}