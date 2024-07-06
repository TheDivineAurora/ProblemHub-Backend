const { response_401, response_403 } = require("../utils/responseCodes.utils");

exports.checkAuthenicated = (req, res, next) => {
    next();
}

exports.checkNotAuthenicated = (req, res, next) => {
    next();
}