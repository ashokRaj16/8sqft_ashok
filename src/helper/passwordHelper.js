import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passGenerator from 'secure-random-password';

// generate random password.
export const generatePassword = async () => {
    let password, encryptPassword;
    password = passGenerator.randomPassword({length: 10, characters:[ passGenerator.lower, passGenerator.digits]});
    encryptPassword = await hashPassword(password);
    return {password, encryptPassword}
}

// generate hash Password
export const hashPassword = async (password) => {
    let encryptPassword = "";
    const saltRound = 10;

    if(password !== null || password !== "")
    {
        encryptPassword = await bcrypt.hash(password, saltRound);
    }
    return encryptPassword;
}

// Verify hash Password
export const comparePassword = async (password, hashPassword = "") => {
    if(await bcrypt.compare(password, hashPassword))
    {
        return true;
    }
    return false;
}

// generate Access & Refresh token.
export const generateToken = (payload, type = "ACCESS") => {
    const access_secret_key = process.env.JWT_SECRET_ACCESS_KEY || "NEXUS_SECRET";
    const refresh_token_key = process.env.JWT_SECRET_REFRESH_KEY || "NEXUS_REFRESH_SECRET"
    
    // ***After testing change to this.
    const expire_in = (type === "ACCESS") ? process.env.JWT_ACCESS_EXPIRES_IN || "30s" : process.env.JWT_REFRESH_EXPIRES_IN || "30s";
    // const expire_in = (type === "ACCESS") ? 86400 : "1d";

    let token;
    if(type === "ACCESS")
    {
        token = jwt.sign( payload, access_secret_key, {expiresIn: expire_in});
    }
    else if(type === "REFRESH") {
        token = jwt.sign( payload, refresh_token_key);
    }
    else{
        return "Invalid token";
    }
    return token;
}

// verify refresh token.
export const verifyRefreshToken = (token, type = "ACCESS") => {
    const secret_key = (type === "ACCESS") ? process.env.JWT_SECRET_ACCESS_KEY || "NEXUS_SECRET_KEY" : process.env.JWT_SECRET_REFRESH_KEY || "NEXUS_REFRESH_SECRET";
    try{
        let tokenDetails = jwt.verify(token, secret_key);
        return { status : true, tokenDetails : tokenDetails };
    }
    catch(err)
    {
        return { status: false, tokenDetails: err };
    }
}