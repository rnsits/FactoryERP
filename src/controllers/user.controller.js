const { StatusCodes } = require("http-status-codes");
const { UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { ServerConfig } = require("../config");
const bcrypt = require('bcrypt');

async function addUser(req, res) {
    try {
        const { username, password, pin, email, address, gstin, company_name, phone, role, auth_method, current_balance, pincode } = req.body;

        let logo = req.file ? `/uploads/images/${req.file.filename}`: null;

        // Hash the password if auth method is username_password
        let hashedPass = null;
        if (auth_method == 'username_password') {
            hashedPass = await bcrypt.hash(password, parseInt(ServerConfig.TOKS));
            if (typeof hashedPass != 'string') {
                ErrorResponse.message = "Failed to hash Password.";
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }
        }

        const user = await UserService.createUser({
            username,
            password: hashedPass,
            pin,      
            email,
            phone,
            company_name,
            address,
            gstin,
            role,           
            auth_method,
            current_balance,
            logo,
            pincode
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

async function userSettings(req, res) {
    try {
        const { username, address, phone, email, pincode, company_name, gstin   } = req.body;
        
        const { id } = req.params; // Extract `id` from route parameter
        
        const check = await UserService.getUser(id);
        if(!check) {
            throw new AppError(["User not found."], StatusCodes.NOT_FOUND)
        }
        // Build the update object dynamically
        const updateData = {};
        if (username) updateData.username = username;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (pincode) updateData.pincode = pincode;
        if (email) updateData.email = email;
        if (company_name) updateData.company_name = company_name;
        if (gstin) updateData.gstin = gstin;

        if (Object.keys(updateData).length == 0) {
            throw new AppError(["At least one field is required to update the customer."], StatusCodes.CONFLICT);
        }

        const user = await UserService.updateUser(id, updateData);
        SuccessResponse.message = "User updated successfully.";
        SuccessResponse.data = user;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while setting user.";
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse)
    }
}

async function updateLogo(req, res) {
    try {
        const { id } = req.body;
        let logo = req.file ? `/uploads/images/${req.file.filename}`: null;
        const user = await UserService.getUser(id);
        const updateUser = await UserService.updateLogo(user.id, logo);
        SuccessResponse.message = "User Logo updated successfully.";
        SuccessResponse.data = updateUser;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error);
        ErrorResponse.message = "Something went wrong while updating  user logo.";
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
    updateUserBalance,
    userSettings,
    updateLogo
}