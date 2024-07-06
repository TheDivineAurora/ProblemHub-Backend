const { response_404, response_500 } = require("../utils/responseCodes.utils");
const jwt = require("jsonwebtoken");
const User = require('../models/user.models');

exports.checkAuthenicated = async (req, res, next) => {
    const authToken = req.cookies?.token || req.token;

    if(!authToken) {
        return response_404(res, "No token provided");
    }

    try {
        const decoded = jwt.verify(authToken, process.env.JWT_KEY);

        const user = await User.findById(decoded._id);

        if(!user){
            return response_404(res, "User not found!");
        }

        req.body.user = user;
        req.user = user;    

        next();
    } catch (error) {
        return response_500(res, "Failed to authenicate user", error);
    }
}
