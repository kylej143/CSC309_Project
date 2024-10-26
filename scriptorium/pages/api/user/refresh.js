import {generateToken, verifyRefreshToken} from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const {refreshToken} = req.body

        if (!refreshToken) {
            return res.status(400).json({
                error: "no token",
            });
        }

        let userV = await verifyRefreshToken(refreshToken)
        if (!userV) {
            return res.status(401).json({
                error: "invalid token",
            });
        }

        const token = generateToken({ userId: userV.id, username: userV.username });
        return res.status(200).json({
            "accessToken": token,
        });
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}