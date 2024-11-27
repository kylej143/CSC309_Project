import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const adminV = await token_handler(req, res);

    // 2. sort comments
    if(req.method === 'GET'){
        if(adminV[0]){
            let page = Number(req.query.page);
            const pageSize = 10;
            
            if (!page) {
                page = 1;
            }
            try{
                const c = await prisma.comment.findMany({orderBy:{flags: 'desc'}, include:{blog: true}});
                
                const c2 = paginateArray(c, pageSize, page);
                res.status(201).json({comments: c2.map(cc => ({id: cc.id, content: cc.content, flags: cc.flags, blogID: cc.blogID}))});
            }catch(error){
                return res.status(503).json({error:'error'});
            }
        }else{
            return res.status(403).json({error: "403 Forbidden"});
        }
    }
}

export function paginateArray(arr, pageSize, pageNumber) {
    // formulas for getting the start and end index of the page that needs to be printed
    let startIndex = pageSize * (pageNumber - 1);
    let endIndex = pageSize * pageNumber - 1;

    // check out of bounds
    if (endIndex + 1 > arr.length) {
        endIndex = Math.min(endIndex, arr.length - 1);
    }
    if (startIndex + 1 > arr.length) {
        return [];
    }
    // return a slice of the array based on indices
    return arr.slice(startIndex, endIndex + 1);
}
