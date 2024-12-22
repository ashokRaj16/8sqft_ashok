import { PrismaClient, categories, tags } from "@prisma/client";

const prisma = new PrismaClient({
    // log: ['query', 'error', 'info', 'warn']
});

export const insertCategories = async (catObject) =>{
    let categoriesData;
    try{
        categoriesData = await prisma.categories.create({
            data: catObject
        })
        return categoriesData;
    }
    catch(error)
    {
        throw error;
    }
}

export const getAllCategories = async (type = "count", where = {}, limit = 0, skip = 0, orderBy = {}) => {
    let categoriesData;
    try{
        if(type === "data")
        {
            categoriesData = await prisma.categories.findMany({
                where: where,
                orderBy: orderBy,
                take: limit,
                skip: skip,
            });
        }

        if(type === "export")
        {
            categoriesData = await prisma.categories.findMany({
                where: where
            });
        }

        if(type === "count")
        {
            categoriesData = await prisma.categories.count({
                where: where
            });
        }
        // categoriesData = await prisma.categories.findMany();
        return categoriesData;
    }
    catch(error)
    {
        throw error;
    }
}

export const updateCategory = async (id, catObject) => {
    let categories;
    try{
        categories = await prisma.categories.update({
            data: catObject,
            where: {id}
        })
        return categories;
    }
    catch(error)
    {
        throw error;
    }
}

export const deleteCategory = async (id) => {
    let categories;
    try{
        categories = await prisma.categories.delete({
            where: {id}
        })
        return categories;
    }
    catch(error)
    {
        throw error;
    }
}

export const getCategoryById = async (id) => {
    let categoriesData;
    try{
        categoriesData = await prisma.categories.findFirst({
            where: {
                id
            }
        })
        return categoriesData;
    }
    catch(error)
    {
        throw error;
    }
}

export const getCategoryByName = async (catObject, id = 0) => {
    let categoriesData;
    let { catName } = catObject;
    try{
        if(id === 0){
            categoriesData = await prisma.categories.findFirst({
                where: {
                    catName: catName 
                }
            })
        }
        else
        {
            categoriesData = await prisma.categories.findFirst({
                where: {
                    catName,
                    NOT: {
                        id : id
                    }
                }
            })
        }
        return categoriesData;
    }
    catch(error)
    {
        throw error;
    }
}

// Tags
export const insertTag = async (tagObject) =>{
    let tagsData;
    try{
        tagsData = await prisma.tags.create({
            data: tagObject
        })
        return tagsData;
    }
    catch(error)
    {
        throw error;
    }
}

export const getAllTags = async (type = "count", where = {}, limit = 0, skip = 0, orderBy = {}) => {
    let tagsData;
    try{
        if(type === "data")
        {
            tagsData = await prisma.tags.findMany({
                where: where,
                orderBy: orderBy,
                take: limit,
                skip: skip,
            });
        }

        if(type === "count")
        {
            tagsData = await prisma.tags.count({
                where: where
            });
        }
        return tagsData;
    }
    catch(error)
    {
        throw error;
    }
}

export const updateTag = async (id, tagObject) => {
    let tag;
    try{
        tag = await prisma.tags.update({
            data: tagObject,
            where: {id}
        })
        return tag;
    }
    catch(error)
    {
        throw error;
    }
}

export const deleteTag = async (id) => {
    let tag;
    try{
        tag = await prisma.tags.delete({
            where: {id}
        })
        return tag;
    }
    catch(error)
    {
        throw error;
    }
}

export const getTagById = async (id) => {
    let tagData;
    try{
        tagData = await prisma.tags.findFirst({
            where: {
                id
            }
        })
        return tagData;
    }
    catch(error)
    {
        throw error;
    }
}

export const getTagByName = async (tagObject, id = 0) => {
    let tagData;
    let { tagName } = tagObject;
    try{
        if(id === 0){
            tagData = await prisma.tags.findFirst({
                where: {
                    tagName : tagName
                }
            })
        }
        else
        {
            tagData = await prisma.tags.findFirst({
                where: {
                    tagName,
                    NOT: {
                        id : id
                    }
                }
            })
        }
        return tagData;
    }
    catch(error)
    {
        throw error;
    }
}

