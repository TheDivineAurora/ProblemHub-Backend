const cloudinary = require('cloudinary').v2;
const { response } = require('express');
const User = require('../models/user.models');
const { response_500, response_200, response_401, response_400 } = require('../utils/responseCodes.utils');

exports.register = async (req, res) => {
    try {
        const {email, username, password} = req.body;
        if(!email || !username || !password)
            return response_400(res, 'Missing required fields');

        const userExists = await User.findOne({ username : username});
        if(userExists){
            return response_401(res, 'Username already exists');
        }
        const profileImageUrl = req.file? await uploadToCloudinary(req.file) : null;
        const newUser = new User({
            username: username,
            email: email,
            password: password,
            profileImageUrl: profileImageUrl
        });
        const savedUser = await newUser.save();

        //sending token in cookie
        const token = await savedUser.generateToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
        });

        return response_200(res, "User created Succesfully", {
            email: savedUser.userExists,
            username: savedUser.username,
        });
    } catch (error) {
        console.log(error);
        return response_500(res, "Error creating user");
    }
}


exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password)
            return response_400(res, 'Missing required fields');
        const userExists = await User.findOne({ email : email})
        .select("password email username")
        .exec();;

        if (!userExists) {
            return response_400(res, "User not found");
        }
        const passwordMatch = await userExists.comparePassword(password);
        if (!passwordMatch) {
            return response_401(res, "Invalid Password");
        }

        //sending token in cookie
        const token = await userExists.generateToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
        });

        return response_200(res, "User Logged In Succesfully", {
            email: userExists.email,
            username: userExists.username,
        });
    } catch (error) {
        console.log(error);
        return response_500(res, "Error Logging in the user");
    }
}

exports.logout = async(req, res) => {
    try{
        res.clearCookie("token");
        return response_200(res, "User logged out succesfully");
    }
    catch(error) {
        return response_500(res, "Error logging out", error);
    }
}

const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder: 'uploads'},
            (error, result) => {
                if(error){
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        stream.end(file.buffer);
    });
};