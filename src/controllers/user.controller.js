const User = require('../models/user.models');
const { response_404, response_400, response_200, response_500, response_401 } = require('../utils/responseCodes.utils');

exports.getUser = async(req, res) => {
    try {
        const username = req.query.username;
        if(!username){
            return response_400(res, "Missing required fields");
        }
        const user = await User.findOne({username : username})
            .select("username profileImageUrl sheets")
            .exec();
        if(!user){
            return response_404(res, "User not found");
        }
    
        return response_200(res, "User found succesfully", user);    
    } catch (error) {
        console.log(error);
        return response_500(res, "Internal server error");
    }

}

exports.updateUser = async(req, res) => {
    try{
        const {userId, ...updateData} = req.body;
        if(!userId){
            return response_400(res, "Missing required fields");
        }
        if(!userId.equals(req.session.id)){
            return response_401(res, "You can only update your account")
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new : true, runValidators: true});
        if(!user){
            return response_404(res, "User not found");
        }
        
        return response_200(res, "User updated succesfully", user);   
    } catch (error) {
        console.log(error); 
        return response_500(res, "Internal server error");              
    }
}

exports.getSessionUser = async(req, res) => {
    try{
        return response_200(res, "User fetched succesfully", req.user);
    } catch (error) {
        console.log(error);
        return response_500(res, "Error in getting Session User");              
    }
}