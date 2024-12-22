import { Request, Response } from "express";
import * as response from "../config/response.js"
import * as categoryModel from '../model/categoryModel.js';
import { categoryVaidator } from "./validation/categoryValdator.js";

// @desc    get categories
// @route   GET /v1/admin/categories
// @access  Private
export const getCategories = async (req: Request, res: Response) => {
    let data : any = {};

    try{
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 2;
        let search = JSON.parse(req.query.search?.toString()||"{}");
        
        // let totalCount: any = await blogModel.getAllBlogs();
        let skip = (page-1) * limit ;
        let startIndex = (page -1) * limit;
        let endIndex = page * limit;

        let whereClause: any = {}
        let pagination : any = {}
        let orderBy : any= {}

        let orderByColumn: any = req.query.orderBy || "catName";
        let order = req.query.order || "asc";
        orderBy[orderByColumn] = order;
        
        if(search.hasOwnProperty('q')){
            whereClause = {
                catName: { contains: search.q }
            };
        }

        let totalCount: any = await categoryModel.getAllCategories("count", whereClause);
        let categories = await categoryModel.getAllCategories("data", whereClause, limit, skip, orderBy);
        
        if(endIndex < Number(totalCount))
        {
            pagination.next = {
                page : page + 1,
                limit
            }
        }
        if(startIndex > 0)
        {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        data['categories'] = categories;
        data['total_count'] = totalCount;
        data['total_pages'] = Math.ceil(totalCount / limit);
        data['pagination'] = pagination;

        return response.successResponseWithData(res, 'Categories retrieved successfully', data)
    }
    catch(error: any)
    {
        console.log(error);
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    add categories
// @route   POST /v1/admin/categories
// @access  Private
export const addCategory = async (req: Request, res: Response) => {
    let data : any;
    let catObject = req.body;
    let {value, error} = categoryVaidator(req.body);
    console.log(value, error);
    if(error)
    {
        return response.errorResponse(400,res, "Validation Error", error);
    }
    try{
        // check if given category already found.
        let category = await categoryModel.getCategoryByName(catObject);
        if(category){
            return response.badRequestResponse(res, 'Category already available. Duplicate not allowed', category);
        }

        data = await categoryModel.insertCategories(catObject);
        return response.successResponseWithData(res, 'Category added successfully.', data);
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    get single categories
// @route   GET /v1/admin/categories/:id
// @access  Private
export const getSingleCategory = async (req: Request, res: Response) => {
    const {id} = req.params;
    let data :any = {};
    // let { value, error} = categoryVaidator(req.body)
    if(!id)
    {
        response.errorResponse(400, res, "Id must be provide with request.");
    }
    try{
        const result = await categoryModel.getCategoryById( parseInt(id) );
        data['categories'] = result;
        response.successResponseWithData(res, 'Category successfully retrieved.', data);
    }
    catch(error: any) 
    {
        return response.errorResponse(500, res, "Internal server error.", error);
    }
}

// @desc    update categories
// @route   POST /v1/admin/categories/:id
// @access  Private
export const editCategory = async (req: Request, res: Response) => {
    let data : any = {};
    let id = parseInt(req.params.id);
    let catObject = req.body;
    try{
        let cat: any = await categoryModel.getCategoryById(id);
        if(!cat){
            return response.badRequestResponse(res, 'No record found with this id.');
        }

        let duplicateCat: any = await categoryModel.getCategoryByName(catObject, id);
        if(duplicateCat)
        {
            return response.successResponseWithData(res, 'Category name already available. Please try different one.', duplicateCat);
        }
        console.log("cattt",duplicateCat);
        
        data['categories'] = await categoryModel.updateCategory(id, catObject);
        
        return response.successResponseWithData(res, 'Category update successfully.', data);
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    remove categories
// @route   DELETE /v1/admin/categories/:id
// @access  Private
export const removeCategory = async (req: Request, res: Response) => {
    let data : any;
    let id  = parseInt(req.params.id);
    console.log(id);
    
    try{
        let cat: any = await categoryModel.getCategoryById(id);
        if(!cat)
            return response.badRequestResponse(res, 'No record found with this id.');
     
        cat = await categoryModel.deleteCategory(id)
        if(cat)
            return response.successResponseWithData(res, 'Category removed successfully.', cat);
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    add Tags
// @route   POST /v1/admin/tags
// @access  Private
export const getAllTags = async (req: Request, res: Response) => {
    let data : any = {};

    try{
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 2;
        let search = JSON.parse(req.query.search?.toString()||"{}");
        
        // let totalCount: any = await blogModel.getAllBlogs();
        let skip = (page-1) * limit ;
        let startIndex = (page -1) * limit;
        let endIndex = page * limit;

        let whereClause: any = {}
        let pagination : any = {}
        let orderBy : any= {}

        let orderByColumn: any = req.query.orderBy || "tagName";
        let order = req.query.order || "asc";
        orderBy[orderByColumn] = order;
        
        if(search.hasOwnProperty('q')){
            whereClause = {
                catName: { contains: search.q }
            };
        }

        let totalCount: any = await categoryModel.getAllTags("count", whereClause);
        let tags = await categoryModel.getAllTags("data", whereClause, limit, skip, orderBy);
        // let blogs :any = await blogModel.getAllBlogs("data", whereClause, limit, skip, orderBy);
        
        if(endIndex < Number(totalCount))
        {
            pagination.next = {
                page : page + 1,
                limit
            }
        }
        if(startIndex > 0)
        {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        data['tags'] = tags;
        data['total_count'] = totalCount;
        data['total_pages'] = Math.ceil(totalCount / limit);
        data['pagination'] = pagination;

        return response.successResponseWithData(res, 'Tags retrieved successfully.', data)
    }
    catch(error: any)
    {
        console.log(error);
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    get single Tag
// @route   GET /v1/admin/tags/:id
// @access  Private
export const getSingleTag = async (req: Request, res: Response) => {
    const {id} = req.params;
    let data :any = {};
    // let { value, error} = categoryVaidator(req.body)
    if(!id)
    {
        response.errorResponse(400, res, "Id must be provide with request.");
    }
    try{
        const result = await categoryModel.getTagById( parseInt(id) );
        data['tags'] = result;
        response.successResponseWithData(res, 'Category successfully retrieved.', data);
    }
    catch(error: any) 
    {
        return response.errorResponse(500, res, "Internal server error.", error);
    }
}

// Category
// @desc    add tags
// @route   POST /v1/admin/tags
// @access  Private
export const addTag = async (req: Request, res: Response) => {
    let data : any;
    let tagObject = req.body;
    try{
        // check if given category already found.
        let tag: any = await categoryModel.getTagByName(tagObject);
        if(tag){
            return response.badRequestResponse(res, 'Tag already available. Duplicate not allowed', tag);
        }

        data = await categoryModel.insertTag(tagObject);
        return response.successResponseWithData(res, 'Tag added successfully.', data);
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// @desc    update tags
// @route   POST /v1/admin/tags/:id
// @access  Private
export const editTag = async (req: Request, res: Response) => {
    let data : any = {};
    let id = parseInt(req.params.id);
    let tagObject = req.body;
    try{
        let tag: any = await categoryModel.getTagById(id);
        if(!tag)
            return response.badRequestResponse(res, 'No record found with this id.');

        let duplicateTag: any = await categoryModel.getTagByName(tagObject, id);
        if(duplicateTag)
        {
            return response.successResponseWithData(res, 'Tag name already available. Please try different one.', duplicateTag);
        }
        data['tags'] = await categoryModel.updateTag(id, tagObject);
        return response.successResponseWithData(res, 'Tag update successfully.', data);
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}

// Category
// @desc    remove tags
// @route   DELETE /v1/admin/tags/:id
// @access  Private
export const removeTag = async (req: Request, res: Response) => {
    let data : any;
    let id  = parseInt(req.params.id);
    try{
        let tag: any = await categoryModel.getTagById(id);
        if(!tag){
            return response.badRequestResponse(res, 'No record found with this id.');
        }
        tag = await categoryModel.deleteTag(id);
        if(tag)
            return response.successResponseWithData(res, 'Tag removed successfully.', tag);
    }
    catch(error: any)
    {
        console.log(error);
        return response.errorResponse(500, res, 'Internal server error.', error)
    }
}