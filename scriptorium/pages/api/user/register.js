import { PrismaClient } from "@prisma/client"
import { hashPassword } from "@/utils/auth";

const prisma = new PrismaClient()

export default async function handler(req, res) {

    if (req.method === "POST") {
        let { username, password, name, email, avatar, phoneNumber } = req.body

        if (!username || !password || !name || !email || !avatar) {
            return res.status(400).json({
                error: "not all fields provided",
            });
        }

        try {
            avatar = Number(avatar)
        }
        catch (error) {
            return res.status(400).json({
                error: "invalid avatar",
            });
        }

        if (phoneNumber) {
            try {
                phoneNumber = phoneNumber.replace(/\s/g, "").replace("-", "");
                if (phoneNumber.length !== 11) {
                    return res.status(400).json({
                        error: "invalid phone number format, try: XXX-XXXX-XXXX",
                    });
                }
                phoneNumber = Number(phoneNumber)
                if (!phoneNumber) {
                    return res.status(400).json({
                        error: "invalid phone number format, try: XXX-XXXX-XXXX",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    error: "invalid phone number format, try: XXX-XXXX-XXXX",
                });
            }
        }

        if (!email.match(/^\S+@\S+\.\S+$/)) {
            return res.status(400).json({
                error: "invalid email, try the format: yourmail@mail.com",
            });
        }

        let user_exist = await prisma.user.findFirst({
            where: {username: {equals: username}}
        })
        if (user_exist) {
            return res.status(400).json({ error: "username already exist!" })
        }
        user_exist = await prisma.user.findFirst({
            where: {email: {equals: email}}
        })
        if (user_exist) {
            return res.status(400).json({ error: "email already in use!" })
        }

        const _ = await prisma.user.create({
            data: {
                username,
                password: await hashPassword(password),
                name,
                email,
                avatar,
                phoneNumber
            },
        })
        return res.status(201).json({message: "user successfully created"})

    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}