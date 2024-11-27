import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(404).json("error");
    } else {
        try {
            const c = await prisma.codeTemplate.findUnique({
                where: { id: parseInt(id, 10) },
                include: {
                    tags: true,
                    blogs: {
                        select: {
                            id: true,
                            title: true,
                            userID: true
                        }
                    },
                }
            });
            if (c) {
                return res.status(200).json(c);
            } else {
                return res.status(404).json("error");
            }
        } catch {
            console.error("error");
        }
    }
}
