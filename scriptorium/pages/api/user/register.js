import prisma from "@/utils/db"
import { hashPassword } from "@/utils/auth";


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
            if (!(1 === avatar || 2 === avatar)) {
                return res.status(400).json({
                    error: "avatar must be 1 or 2, current choice of avatar does not exist",
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                error: "invalid avatar",
            });
        }

        try {
            if (password.length < 9) {
                return res.status(400).json({
                    error: "PS: password too short, at least 9",
                });
            }
            if (password.toLowerCase() === password) {
                return res.status(400).json({
                    error: "PS: include at least 1 capital letter",
                });
            }
            if (!(/\d/.test(password))) {
                return res.status(400).json({
                    error: "PS: include at least 1 number",
                });
            }
        }
        catch (error) {
            return res.status(400).json({
                error: "invalid password",
            });
        }

        if (phoneNumber) {
            try {
                phoneNumber = phoneNumber.replace(/\s/g, "");
                if (phoneNumber.length !== 11) {
                    return res.status(400).json({
                        error: "invalid phone number format, try: XXX XXXX XXXX",
                    });
                }
                let isPNumber = Number(phoneNumber)
                if (!isPNumber) {
                    return res.status(400).json({
                        error: "invalid phone number format, try: XXX XXXX XXXX",
                    });
                }
            }
            catch (error) {
                return res.status(400).json({
                    error: "invalid phone number format, try: XXX XXXX XXXX",
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
        return res.status(405).json({ error: "Method not allowed" });
    }
}