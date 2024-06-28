const cheerio = require('cheerio')
const axios = require('axios');
const puppeteer = require('puppeteer');
const { response_400, response_404, response_500 } = require('../utils/responseCodes.utils');

exports.deconstructUrl = async (req, res, next) => {
    const { problemUrl } = req.body;
    if(!problemUrl) 
        return response_400(res, "Missing required fields")

    const parsedUrl = new URL(problemUrl);
    const pathnameParts = parsedUrl.pathname.split('/');
    const hostname = parsedUrl.hostname;
    switch(hostname.toLowerCase()){
        case 'codeforces.com' : {
            if(problemUrl.includes('problemset/problem')){
                req.body.problem = {
                    url : problemUrl,
                    judge : hostname,
                    code : pathnameParts[3] + pathnameParts[4],
                    contestId : pathnameParts[3],
                    index : pathnameParts[4],
                }
            }
            else if(problemUrl.includes('contest')){
                req.body.problem = {
                    url : problemUrl,
                    judge : hostname,
                    code : pathnameParts[2] + pathnameParts[4],
                    contestId : pathnameParts[2],
                    index : pathnameParts[4],
                }
            }
            else {
                return response_404(res, "Invalid Link");
            }
            return next();
        }

        case 'www.codechef.com' : {     
            if(!problemUrl.includes('problems')){
                return response_404(res, "Invalid problem link");
            }
            try {            
                req.body.problem = {
                    url : problemUrl,
                    judge : 'codechef.com',
                    code : pathnameParts[2],        
                }
                return next();
            } catch (error) {
                return response_500(res, "Internal server error");
            }
        }

        case 'atcoder.jp' : {
            if(!problemUrl.includes('contests')){
                return response_404(res, "Invalid problem link");
            }
            try {            
                req.body.problem = {
                    url : problemUrl,
                    judge : hostname,
                    code : pathnameParts[4],        
                }
                return next();
            } catch (error) {
                return response_500(res, "Internal server error");
            }
        }

        case 'leetcode.com' : {
            if(!problemUrl.includes('problems')){
                return response_404(res, "Invalid problem link");
            }
            try {         
                const problemName = pathnameParts[2].replace(/-/g, ' ');
                const problemCode = generateLeetcodeProblemCode(problemName);
                req.body.problem = {
                    name: problemName,
                    url : problemUrl,
                    judge : hostname,
                    code : problemCode,        
                }
                return next();
            } catch (error) {
                return response_500(res, "Internal server error");
            }
        }
    }

}
function generateLeetcodeProblemCode(problemName){
    let problemCode = "A";    
    const words = problemName.split(" ");

    for(let i = 0; i < words.length; i++){
        problemCode += words[i][0];
        problemCode += words[i][words[i].length - 1];
        if(problemCode.length >= 12) break;
    }
    return problemCode.toUpperCase();
}