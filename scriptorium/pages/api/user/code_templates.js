import { PrismaClient } from '@prisma/client';
import token_handler from '@/pages/api/user/protected';

const prisma = new PrismaClient();

export default async function handler(req, res){
    let userV = await token_handler(req, res)
   
    //connectOrCreate is generated by gpt

    // 2. view, search and 5. search(visitor)
    if(req.method === 'GET' && !(req.query.id || req.query.blogs)){
        const {title, tags, explanation} = req.query;
        
        let filter = {};
    
        if(title){
            filter.title = {equals: title};
        }
        if(tags){
            const tt = tags.split(',').map(t => t.trim()).filter(Boolean);
            if(tt.length > 0){
                filter.tags = {some: {tag: {in: tt}}};
            }
        }
        if(explanation){
            filter.explanation = {equals: explanation};
        }
    
        try {
            const code_template2 = await prisma.codeTemplate.findMany({where: filter, include: {tags: true}});
            return res.status(200).json(code_template2);
        }catch(error){
            return res.status(503).json({error:'error'});
        }
    }

    // 3. edit, delete
    if(req.method === 'PUT'){
        if(!userV){
            return res.status(403).json({error: "403 Forbidden"});
        }

        const {id} = req.query;
        const {title, explanation, code, tags} = req.body;

        try{
            const temp = await prisma.codeTemplate.findUnique({where: {id: parseInt(id)}});

            if(!temp){
                return res.status(403).json({error: "Code Template does not exist."});
            }
            if(userV.id !== temp.userID){
                return res.status(403).json({error: "You can only edit your own code templates."});
            }

            let edit = {};
            if(title){
                edit.title = title;
            } 
            if(explanation){
                edit.explanation = explanation;
            }
            if(code){
                edit.code = code;
            }
            if(tags){
                edit.tags = {set: [], connectOrCreate: tags.map((t) => ({where: {tag: t}, create: {tag: t},}))};
            }

            const code_template3 = await prisma.codeTemplate.update({where: {id: parseInt(id)}, data: edit});
            return res.status(200).json(code_template3);
        }catch(error){
            return res.status(503).json({error:'error'});
        }
    }else if(req.method === 'DELETE'){
        if(!userV){
            return res.status(403).json({error: "403 Forbidden"});
        }

        const {id} = req.query;
        const temp = await prisma.codeTemplate.findUnique({where: {id: parseInt(id)}});

        if(!temp){
            return res.status(403).json({error: "Code Template does not exist."});
        }
        if(userV.id !== temp.userID){
            return res.status(403).json({error: "You can only delete your own code templates."});
        }

        await prisma.codeTemplate.delete({where:{id: parseInt(id)}});
        return res.status(200).end();
    } 

    // 4. fork
    if(req.query.fork && req.method === 'POST'){
        const {id} = req.query;        
        const {title, explanation, code, tags} = req.body;
        
        try{
            const temp = await prisma.codeTemplate.findUnique({where: {id: parseInt(id)}});
    
            if(!temp){
                return res.status(403).json({error: "Code Template does not exist."});
            }

            if(userV){
                const {title: title2, explanation: explanation2, code: code2, tags: tags2} = temp;

                const title3 = title || title2;
                const explanation3 = explanation || explanation2;
                const code3 = code || code2;
                const tags3 = tags || tags2.map(t => t.tag);

                const code_template4 = await prisma.codeTemplate.create({
                    data: {title: title3, explanation: explanation3, code: code3, forkID: parseInt(id), user: {connect: {id: userV.id}}, tags: {
                        connectOrCreate: tags3.map((t) => ({where: {tag: t}, create: {tag: t}}))} 
                    }
                });
                return res.status(200).json(code_template4);
            }else{
                const title4 = title || temp.title;
                const explanation4 = explanation || temp.explanation;
                const code4 = code || temp.code;
                const tags4 = tags || temp.tags.map(tag => tag.tag);

                return res.status(200).json({
                    message: "In order for you to save this, you have to log in.", fork_code_template: {
                        fork_from: temp.id,
                        title: title4,
                        explanation: explanation4,
                        code: code4,
                        tags: tags4
                    }
                });
            }
        }catch(error){
            return res.status(503).json({error:'error'});
        }
    }

    // 1. save
    if(req.method === 'POST'){
        if(!userV){
            return res.status(403).json({error: "403 Forbidden"});
        }

        const {title, explanation, code, tags} = req.body;

        try{
            const code_template1 = await prisma.codeTemplate.create({
                data:{title, explanation, code, user: {connect:{id: userV.id}}, tags:{
                    connectOrCreate: tags.map((t) => ({where: {tag: t}, create: {tag: t}}))} 
                }
            });
            return res.status(201).json(code_template1);
        }catch(error){
            return res.status(503).json({error:'error'});
        }
    }

    // 5. GET BLOG POSTS THAT MENTION TEMPLATE
    if (req.query.id && req.query.blogs && req.method === 'GET') {

        const id = Number(req.query.id);

        try {

            // ensure that template exists
            const templateResult = await prisma.codeTemplate.findUnique({
                where: {
                    id,
                }
            })

            if (!templateResult) {
                return res.status(404).json({ error: "Template does not exist" });
            }

            // get associated blog posts
            const result = await prisma.blog.findMany({
                where: {
                    templates: {
                        some: { id: id },
                    }
                }
            })

            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(403).json({ error: "Could not get associated blog posts" });
        }

    }
}
