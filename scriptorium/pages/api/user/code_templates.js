import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth'; 

const prisma = new PrismaClient();

export default async function handler(req, res){
    const token = req.headers.authorization;
    const userV = verifyToken(token);  

    // 1. save
    if(req.method === 'POST'){
        if(userV){
            const {title, explanation, code, Tag} = req.body;

            try{
                const code_template1 = await prisma.codeTemplate.create({
                    data:{title, explanation, code, user: {connect:{id: userV.id}}, Tag:{
                        connectOrCreate: Tag.map((t) => ({where: {tag: t}, create: {tag: t}}))}  
                    }
                });
                return res.status(201).json(code_template1);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    }

    // 2. view, search + 5. search(visitor)
    if(req.method === 'GET'){
        const {title, tags, content} = req.query;
        
        let filter = {};
    
        if(!userV){
            filter.private = false; 
        }else{
            filter.userId = userV.id; 
        }
    
        if(title){
            filter.title = {contains: title, mode: 'insensitive'};
        }
        if(tags){
            const a = tags.split(',').map(t => t.trim()).filter(Boolean);  
            if(a.length){
                filter.Tag = {some: {tag: {in: a}}};
            }
        }
        if(content){
            filter.OR = [
                {code: {contains: content, mode: 'insensitive'}},
                {explanation: {contains: content, mode: 'insensitive'}}
            ];
        }
    
        try {
            const code_template2 = await prisma.codeTemplate.findMany({where: filter, include: {Tag: true, user: true}});
            return res.status(200).json(code_template2);
        }catch(error){
            return res.status(500).json({error:'error'});
        }
    }

    // 3. edit, delete
    if(req.method === 'PUT'){
        const {id} = req.query;
    
        if(userV){
            const {title, explanation, code, Tag} = req.body;
    
            try{
                const code_template3 = await prisma.codeTemplate.update({
                    where: {id: parseInt(id)}, 
                    data: {title, explanation, code, Tag:{set: [], 
                        connectOrCreate: Tag.map((t) => ({where: {tag: t}, create: {tag: t}}))} 
                    },
                });
                return res.status(200).json(code_template3);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    }else if(req.method === 'DELETE'){
        const {id} = req.query;

        if(userV){
            await prisma.codeTemplate.delete({where:{id: parseInt(id)}});
            return res.status(204).end();
        }else{
            return res.status(401).json({error:'the user has invalid token'});
        }
    } 

    // 4. use, fork
    if(req.query.fork && req.method === 'POST'){
        const {id} = req.query;
      
        if(userV){
            const {title, explanation, code, Tag} = req.body;
            
            try{
                const code_template4 = await prisma.codeTemplate.create({
                    data: {title, explanation, code, forkID: parseInt(id), user: {connect: {id: userV.id}}, Tag: {
                        connectOrCreate: Tag.map((t) => ({where: {tag: t}, create: {tag: t}}))}
                    }
                });
                return res.status(201).json(code_template4);
            }catch(error){
                return res.status(500).json({error:'error'});
            }
        }else{
            return res.status(401).json({error:'the visitor has invalid token'});
        }
    }
}