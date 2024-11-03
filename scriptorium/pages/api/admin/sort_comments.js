import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/admin/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    const adminV = await token_handler(req, res);

    // 2. sort comments
    if(req.method === 'GET'){
        if(adminV[0]){
            try{
                const c = await prisma.comment.findMany({orderBy:{flags: 'desc'}});
                
                res.status(200).json({numberofcomments: c.length,
                    comments: c.map(cc => ({id: cc.id, title: cc.title, flags: cc.flags}))});
            }catch(error){
                return res.status(503).json({error:'error'});
            }
        }else{
            return res.status(403).json({error: "403 Forbidden"});
        }
    }
}
