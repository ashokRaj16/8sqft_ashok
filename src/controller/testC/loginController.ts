import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import * as response from '../config/response.js';

import * as loginModel from '../model/userModel.js';
import { User } from '../model/source/userSource.js';

import { generateSecretToken } from '../helper/commonHelper.js';
import { hashPassword, comparePassword, generateToken, verifyRefreshToken } from '../helper/passwordHelper.js';
import { loginValidator, registerUserValidator, tokenValidator, emailValidator, recoverPasswordValidator } from './validation/userValidator.js';
import { addDate } from '../helper/commonHelper.js';
import { sendMail } from "../helper/mailHelper.js";

// @desc    Admin login     //store token in redis key and check if it is available at admin auth then for authorization. 
// @route   POST /v1/login
// @access  Private
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    let user: User | null, data: any = {}; 
    let access_token : string, refresh_token: string ;

    let {value, error} = loginValidator(req.body)
    if(error)
    {
        return response.errorResponse(400, res, 'Validation error.', error);
    }

    user = await loginModel.login(email);
    if(!user)
    {
        return response.badRequestResponse(res, 'No user found, Please check email address.');
    }
    // compare password.
    if(!await comparePassword(password, user.password))
    {
        return response.badRequestResponse(res,'Invalid password! Please check password.');
    }
    
    try{
        let jwtPayload = {
            user_id: user.id,
            email:email,
            userRole: (user as any).role.rolename,
            isSecure: true
        }
        let refreshPayload = {
            user_id : user.id,
            email : email
        }
        access_token = generateToken(jwtPayload, "ACCESS");
        refresh_token = generateToken(refreshPayload, "REFRESH");

        // Store refresh token.
        let tokenObject = {
            user_id: user.id,
            auth_token : refresh_token,
            expireAt: addDate(31)
        }
        let isAuthToken = await loginModel.storeRefreshToken(tokenObject);
        if(!isAuthToken)
        {
            return response.badRequestResponse(res, 'Unable to store refresh token.');
        }
        
        data['user'] = {
            id: user.id,
            email: user.email,
            fullName: user.firstName,
            role: (user as any).role?.rolename,
            accessToken: access_token,
            expire_in: process.env.JWT_ACCESS_EXPIRES_IN_SECONDS  || '60s',
            refreshToken: refresh_token
        };
        
        // ???find solution to store token in cookie or pass it as response
        // res.cookie("accessToken", access_token, {
        //     secure: false,
        //     httpOnly: true,
        //     expires: addDate(1)
        // })

        response.successResponseWithData(res, 'Successfully logged in.', data);
    }
    catch(error : any)
    {
        return response.errorResponse(500,res, 'Internal server error.', error);
    }
}

// @desc    get refresh token if user expires token.
// @route   POST /v1/token
// @access  Private
export const refreshToken = async (req: Request, res:Response) => {
    let data: any={}, access_token: string;
    let { refreshToken } = req.body;
    let { value, error} = tokenValidator(req.body);
    console.log('token',refreshToken);
    if(error)
    {
        return response.errorResponse(400, res, "Validation Error.", error)
    }

    try{
        let {status, tokenDetails} = verifyRefreshToken(refreshToken, "REFRESH");
        
        if(status === false)
        {
            return response.badRequestResponse(res, tokenDetails);
        }
        
        // Check user and its token is valid
        let isValidToken = await loginModel.isValidToken( tokenDetails );
        if( !isValidToken ){
            return response.badRequestResponse(res, 'Invalid refresh token. Please login to access data.');
        }

        let jwtPayload = {
            user_id: tokenDetails?.user_id,
            email: tokenDetails?.email,
            userRole: tokenDetails.role,
            isSecure: true
        }
        access_token = generateToken(jwtPayload, "ACCESS")
        data['token'] ={
            accessToken: access_token,
            expire_in: process.env.JWT_ACCESS_EXPIRES_IN_SECONDS  || '60s',
        }
        return response.successResponseWithData(res, 'Access token successfully assign.', data)
    }
    catch(error : any)
    {
        return response.errorResponse(500,res, 'Internal server error.', error);
    }
}

// @desc    save Admin registration
// @route   POST /v1/register
// @access  Private
export const registerUser = async (req: Request, res: Response) => {
    let user :any = {};
    let {value, error } = registerUserValidator(req.body);
    if(error)
    {
        return response.errorResponse(400, res, 'Validation Error', error)
    }

    const {firstName, middleName, lastName, gender, email, password, roleId} = req.body;
    
    try{
        // encrypt password.
        let newPassword = await hashPassword(password);
        
        // check valid userRole.
        if(!await loginModel.checkUserRole(roleId))
        {
            return response.badRequestResponse(res, "No user role found.");
        }
        // check email exists.
        if(await loginModel.isEmailExists(email))
        {
            return response.badRequestResponse(res, "Email already exist. Please try with different email or go for login.");
        }
        let userObject = {
            firstName,
            middleName,
            lastName,
            gender,
            email,
            password: newPassword,
            roleId
        }

        user = await loginModel.registerUser(userObject)
        if(!user)
        {
            return response.badRequestResponse(res, 'Unable to create user. Please try again later.');
        }
        response.postSuccessResponse(res, 'User successfully register.', user);
    }
    catch(error : any)
    {
        return response.errorResponse(500,res, 'Internal server error.', error);
    }
}

// @desc    send Forgot password mail //use path module to create proper path, update all html files, make compatible with mail support //use table
// @route   POST /v1/forgotpassword
// @access  Private
export const forgetPassword = async (req: Request, res: Response) => {
    try{

        let { email } = req.body;
        let createdAt = new Date();
        let { value, error } = emailValidator(req.body);

        if(error){
            return response.badRequestResponse(res, "Validation Error.", error);
        }
        let userinfo = await loginModel.getUserByEmail(email);
        if(!userinfo)
        {
            return response.badRequestResponse(res, "Provided email address not register with us. Please enter correct email id.");
        }

        let token :string = generateSecretToken();
        let subject = "Password Reset <Nexus Yard>"
        let text = "Generate new password.";
        // let filePath = path.join(path.dirname(), './assets/template/resetpassword.html');
        // console.log(filePath);
        
        let readFile = fs.readFileSync(`./assets/template/resetpassword.html`, "utf8").toString();
        if(!readFile)
        {
            return response.badRequestResponse(res, "Something went wrong. unable to generate recover password.");
        }
        let template = handlebars.compile(readFile);
        let replacements = {
            email: email,
            token: token,
            createdAt: new Date().toLocaleDateString()
        }

        let html = template(replacements);
        let mail = await sendMail(email, subject, text, html )
        
        if(mail.error)
        {
            return response.badRequestResponse(res, "Something went wrong. unable to generate recover password.");
        }
        // save info to database user_password_reset_token
        let resetToken = await loginModel.savePasswordResetToken(userinfo, token);
        if(!resetToken)
        {
            return response.badRequestResponse(res, "Something went wrong. unable to generate recover password.");
        }
        return response.successResponseWithData(res, "Password generate link successfully mail to given mail.");
    }
    catch(error: any)
    {
        response.errorResponse(500, res, "Internal server error.", error);
    }
}

// @desc    Recover Password
// @route   POST /v1/recoverpassword
// @access  Private
export const recoverPassword = async (req: Request, res: Response) => {
    try{
        let token = req.params.id;
        let { password, confirmPassword } = req.body;

        let {value, error} = recoverPasswordValidator(req.body);
        if(error)
        {
            return response.badRequestResponse(res, "Id must be include in request.", error);
        }
        if(!token)
        {
            return response.badRequestResponse(res, "Id must be include in request.");
        }
        if(password === "" || confirmPassword === "")
        {
            return response.badRequestResponse(res, "Password or confirm password required.");
        }

        if(password !== confirmPassword)
        {
            return response.badRequestResponse(res, "Password and confirm password doesn't match.");
        }
        
        let checkValidLink: any = await loginModel.checkResetPassword(token);
        if(!checkValidLink)
        {
            return response.badRequestResponse(res, "Invalid link address.");
        }
        if(checkValidLink.verify === true)
        {
            return response.badRequestResponse(res, "Link already used to reset password.");
        }
        if(checkValidLink.expireAt <= new Date())
        {
            return response.badRequestResponse(res, "Link get expired please generate new link.");
        }

        let userInfo : any = await loginModel.getUserById(checkValidLink.userId)

        let encryptPassword : string = await hashPassword(password);
        let updateUser = await loginModel.resetPassword(checkValidLink.id, userInfo.id, encryptPassword);
        if(updateUser)
        {
            return response.successResponse(res, "User password updated successfully.")
        }
    }
    catch(error: any)
    {
        response.errorResponse(500, res, "Internal server error.");
    }
}