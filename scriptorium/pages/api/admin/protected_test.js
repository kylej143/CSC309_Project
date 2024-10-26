import token_handler from "./protected";


export default async function handler(req, res) {

    let userV = await token_handler(req, res)

    if (!userV) {
        return res.status(403).json({error: "403 Forbidden"})
    }
    if (!userV[0]) {
        return res.status(403).json({error: "Not Admin"})
    }

    return res.status(200).json(userV)
}