const cloudinary = require('cloudinary').v2;
const User = require('../models/user.models');
const { response_500, response_200, response_401, response_400 } = require('../utils/responseCodes.utils');

exports.register = async (req, res) => {
    try {
        const {email, password, username} = req.body;
        if(!email || !password || !username)
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
        await newUser.save();
    
        return response_200(res, "Account created Succesfully", newUser);
    } catch (error) {
        console.log(error);
        return response_500(res, "Internal Server Error");
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
}