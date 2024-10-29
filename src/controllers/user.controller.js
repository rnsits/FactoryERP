const { StatusCodes } = require("http-status-codes");
const { UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { ServerConfig } = require("../config");
const bcrypt = require('bcrypt');

async function addUser(req, res) {
    try {
        const { username, password, pin, email, phone, role, auth_method, current_balance } = req.body;
        
        // Validate raw password before hashing
        if (!password || typeof password !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Password must be a string",
                error: "Invalid password format"
            });
        }

        // Validate password length before hashing
        if (password.length < 8 || password.length > 20) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Password must be between 8 and 20 characters",
                error: "Invalid password length"
            });
        }

          // Hash the password
          const hashedPass = await bcrypt.hash(password, ServerConfig.TOKS);
          
        
        //  Verify that hashedPass is a string
          if (typeof hashedPass !== 'string') {
              throw new Error('Password hashing failed');
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