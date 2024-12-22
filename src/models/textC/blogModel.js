import { PrismaClient, blog } from "@prisma/client";
import { title } from "process";
import connection from '../../config/connect';

let prisma = new PrismaClient();

export const getAllBlogs = async (type = "count", where, limit, skip, orderBy) => {
    let blogs;
    try{
        if(type === "data")
        {
            blogs = await prisma.blog.findMany({
                where: where,
                include: {
                    tags: true
                },
                orderBy: orderBy,
                take: limit,
                skip: skip,
            });
        }

        if(type === "export")
        {
            blogs = await prisma.blog.findMany({
                where: where
            });
        }

        if(type === "count")
        {
            blogs = await prisma.blog.count({
                where: where
            });
        }
        return blogs;
    }
    catch(error)
    {
        throw error;
    }
}

export const getBlogById = async (id) => {
    let blogs;
    try{
        blogs = await prisma.blog.findFirst({
            where: {
                id
            }
        });
        return blogs;
    }
    catch(error)
    {
        throw error;
    }
}

export const insertBlog = async (blogObject ) =>{
    let blog;
    try{
        blog = await prisma.blog.create({
            data: {
                ...blogObject,
            },            
        });
        return blog;
    }
    catch(error)
    {
        throw error;
    }
}

export const updateBlog = async (id, blogObject) => {
    let blog;
    try{
        blog = await prisma.blog.update({
            data: blogObject
            ,
            where: {
                id :id
            }
        });
        return blog;
    }
    catch(error)
    {
        throw error;
    }
}

export const deleteBlog = async (id) => {
    let blog; 
    try{
        let blog = await prisma.blog.delete({
            where: { id}
        })
        return blog;
    }
    catch(error)
    {
        throw error;
    }
}

export const getBlogByName = async (title , id = "") => {
    let blogs;
    try{
        // console.log(id)
        if(id === "")
        {
            blogs = await prisma.blog.findFirst({
                where: {
                    title
                }
            });
        }
        else
        {
            blogs = await prisma.blog.findFirst({
                where: {
                    title,
                    NOT:{
                        id
                    }
                }
            });

        }
        return blogs;
    }
    catch(error)
    {
        throw error;
    }
}
