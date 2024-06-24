const url = require('url');
const Problem = require('../models/problem.models');
const { response_400 } = require('../utils/responseCodes.utils');

exports.deconstructUrl = async (req, res, next) => {
    const { problemUrl } = req.body;
    if(!problemUrl) 
        return response_400(res, "Missing required fields")

    const parsedUrl = new URL(problemUrl);
    const pathnameParts = parsedUrl.pathname.split('/');
    const hostname = parsedUrl.hostname;
    if(problemUrl.includes('problemset/problem')){
        req.body.problem = {
            url : problemUrl,
            judge : hostname,
            code : pathnameParts[3] + pathnameParts[4],
            contestId : pathnameParts[3],
            index : pathnameParts[4],
        }
    }
    else{
        req.body.problem = {
            url : problemUrl,
            judge : hostname,
            code : pathnameParts[2] + pathnameParts[4],
            contestId : pathnameParts[2],
            index : pathnameParts[4],
        }
    }

    next();
}