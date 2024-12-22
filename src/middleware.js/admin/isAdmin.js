import * as response from "../config/response.js";

// Only viewable permission
export const isAdminView = async (req, res, next) => {
    let user = req.userAuthToken;
    // let role = user.role
    if(user.permission.view !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    next();
}

// create and update permission
export const isAdminEdit = async (req, res, next) => {
    let user = req.userAuthToken;
    // let role = user.role
    if(user.permission.edit !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    next();
}

// check only edit permission
export const isAdminDelete = async (req, res, next) => {
    let user = req.userAuthToken;
    // let role = user.role
    if(user.permission.delete !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    next();
}

// Check and update as per required.
export const isMember = async (req, res, next) => {
    let user = req.userAuthToken;
    // let role = user.role
    if(user.permission.view !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    if(user.permission.edit !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    if(user.permission.delete !== true)
    {
        return response.errorResponse(400, res, "You don't have permission to access this content.")
    }
    next();
}