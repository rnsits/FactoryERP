const { StatusCodes } = require("http-status-codes");
const { UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const AppError = require("../utils/errors/app.error");

async function addUser(req, res) {
    try {
        const { username, password, pin, email, phone, role, auth_method } = req.body;
        if (auth_method === 'username_password' && !password) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse= "Password required");
        } else if (auth_method === 'pin' && !pin) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponse.message = "Pin Required");
        }   
        const user = await UserService.createUser({
            username,
            password,
            pin,      
            email,
            phone,
            role,           
            auth_method,    
        });
        SuccessResponse.message = "User added successfully";
        SuccessResponse.data = user;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.message = "Failed to add user.";
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
    
}

async function getUser(req,res){
    try{
        const user = await UserService.getUser();
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
        const users = await UserService.getAllUsers(); 
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


module.exports = {
    addUser,
    getUser,
    getAllUsers
}