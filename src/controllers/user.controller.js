const { StatusCodes } = require("http-status-codes");
const { UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { ServerConfig } = require("../config");
const bcrypt = require('bcrypt');

async function addUser(req, res) {
    try {
        const { username, password, pin, email, phone, role, auth_method, current_balance } = req.body;

        // Hash the password if auth method is username_password
        let hashedPass = null;
        if (auth_method === 'username_password') {
            hashedPass = await bcrypt.hash(password, parseInt(ServerConfig.TOKS));
            if (typeof hashedPass !== 'string') {
                throw new Error('Password hashing failed');
            }
        }

        const user = await UserService.createUser({
            username,
            password: hashedPass,
            pin,      
            email,
            phone,
            role,           
            auth_method,
            current_balance   
        });
        SuccessResponse.message = "User added successfully";
        SuccessResponse.data = user;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log("Error while adding user", error);
        ErrorResponse.message = "Failed to add user.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getUser(req,res){
    try{
        const user = await UserService.getUser(req.params.userId);
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = user;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse) 
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting User";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function getAllUsers(req, res){
    try{
        const users = await UserService.getAllUser(); 
        SuccessResponse.message = "Successfully completed the request";
        SuccessResponse.data = users;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while getting Users";
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
    }
}

async function updateUserBalance(req, res){
    try{
        const user_id = req.user.id;
        console.log("userid", user_id);
        
        const userBal = await UserService.updateUserBalance(user_id, req.body.amount);
        SuccessResponse.message = "Successfully updated the User";
        SuccessResponse.data = userBal;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while updating User.";
        ErrorResponse.error = error;
        return res 
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse)
    }
}


module.exports = {
    addUser,
    getUser,
    getAllUsers,
    updateUserBalance
}