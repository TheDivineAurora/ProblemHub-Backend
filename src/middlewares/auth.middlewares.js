const { response_401, response_403 } = require("../utils/responseCodes.utils");

exports.checkAuthenicated = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }
    return response_401(res);
}

exports.checkNotAuthenicated = (req, res, next) => {
    if(req.isAuthenticated()){
        return response_403(res);
    }
    next();
}