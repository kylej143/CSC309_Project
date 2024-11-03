import token_handler from "./protected";


export default async function handler(req, res) {

    let userV = await token_handler(req, res)

    if (!userV) {
        return res.status(403).json({error: "403 Forbidden"})
    }
    return res.status(200).json({"username" : userV.username,
    "name": userV.name
    "email": userV.email,
    "avatar": userV.avatar,
    "phoneNumber": userV.phoneNumber,})
}