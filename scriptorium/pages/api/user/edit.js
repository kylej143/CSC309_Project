import prisma from "@/utils/db"
import {generateRefreshToken, generateToken} from "@/utils/auth";
import token_handler from "./protected";
import {hashPassword} from "@/utils/auth";


export default async function handler(req, res) {
    if (req.method === "PUT") {

        let userV = await token_handler(req, res)

        if (!userV) {
            return res.status(403).json({error: "403 Forbidden"})
        }

        let { username, password, name, email, avatar, phoneNumber } = req.body

        if (username === "") username = undefined;
        if (password === "") password = undefined;
        if (name === "") name = undefined;
        if (email === "") email = undefined;
        if (avatar === "") avatar = undefined;
        if (phoneNumber === "") phoneNumber = undefined;


        if (username) {
            try {
                if (await prisma.user.findUnique({
                    where: {
                        username: username,
                    },
                })) {
                    return res.status(400).json({error: "Username already exists!"});
                }
            }
            catch (error) {
                    return res.status(400).json({
                        error: "invalid username",
                    });
            }
        }

        if (password) {
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
        }

        if (email) {
            try {
                if (!email.match(/^\S+@\S+\.\S+$/)) {
                    return res.status(400).json({
                        error: "invalid email, try the format: yourmail@mail.com",
                    });
                }
                if (await prisma.user.findFirst({
                    where: {email: {equals: email}}
                })) {
                    return res.status(400).json({ error: "email already in use!" })
                }
            }
            catch (error) {
                return res.status(400).json({
                    error: "invalid email",
                });
            }
        }

        if (avatar) {
            try {
                avatar = Number(avatar)
                if (!(1 <= avatar && 5 >= avatar)) {
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

        const new_user = await prisma.user.update({
            where: {
                id: userV.id
            },
            data: {
                username,
                password: Boolean(password)? await hashPassword(password): undefined,
                name,
                email,
                avatar,
                phoneNumber
            }
        })
        if (!new_user) {
            return res.status(400).json({error: "update failed"})
        }

        const token = generateToken({ userId: userV.id, username: new_user.username });
        const refreshToken = generateRefreshToken( { userId: userV.id, username: new_user.username })
        return res.status(200).json({
            "accessToken": token, "refreshToken": refreshToken,
        });

    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
