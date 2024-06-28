const axios = require('axios')
const Problem = require('../models/problem.models')
const Sheet = require('../models/sheet.models')
const { response_400, response_200, response_500, response_401, response_404 } = require('../utils/responseCodes.utils');
const problemModels = require('../models/problem.models');
const { default: puppeteer } = require('puppeteer');
const cheerio  = require('cheerio');


exports.addProblemToSheet = async (req, res) => {
    try {
        const { problem, sheetId } = req.body;
        if(!problem || !sheetId){
            return response_400(res, "Missing Fields");
        }

        const sheet = await Sheet.findById(sheetId);
        if(!sheet){
            return response_404(res, "Sheet not found");
        }

        const problemExists = await Problem.findOne({ problemCode: problem.code });
        if(problemExists){
            if(!sheet.problems.includes(problemExists._id)){
                sheet.problems.push(problemExists._id);
                await sheet.save();
            }
            return response_200(res, "Succesfully added the problem", sheet);
        }

        await fetchProblemDetails(problem);

        const problemAdded = await Problem.findOne({problemCode: problem.code});

        if(!problemAdded)
            return response_500(res, "Failed to fetch the problem details");

        sheet.problems.push(problemAdded._id);
        await sheet.save();

        return response_200(res, "Succesfully added the problem", sheet);
        
    } catch (error) {
        console.log(error);
        return response_500(res, "Internal server error");
    }
}


const fetchProblemDetails = async ( problem ) => {
    switch(problem.judge.toLowerCase()){
        case 'codeforces.com' :
            await fetchCodeforcesProblem(problem);
            return;
        case 'codechef.com' : 
            await fetchCodechefProblem(problem);
            return;
        case 'atcoder.jp' : 
            await fetchAtcoderProblem(problem);
            return;
        case 'leetcode.com' : 
            await fetchLeetCodeProblem(problem);
            return;
    }
}

const fetchAtcoderProblem = async (problem) => {
    try {   
        const response = await axios.get(problem.url);
        const $ = cheerio.load(response.data);

        const problemName = $('.col-sm-12 span.h2:first-child').contents().filter(function() {
            return this.type === 'text';
        }).text().trim().substring(4);

        const newProblem = new Problem({
            name : problemName,
            problemUrl : problem.url,
            problemJudge : problem.judge,
            problemCode : problem.code
        });

        await newProblem.save();

    } catch (error) {
        console.log(error);
    }
}

const fetchLeetCodeProblem = async(problem) => {
    try {
        const newProblem = new Problem({
            name: problem.name,
            problemUrl : problem.url,
            problemJudge : problem.judge,
            problemCode : problem.code
        })
        await newProblem.save();
    } catch (error) {
        console.log(error);
    }
}

const fetchCodechefProblem = async(problem) => {
    try{
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(problem.url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#problem-statement');

        const problemName = await page.evaluate(() => {
            const h3Element = document.querySelector('#problem-statement h3');
            return h3Element ? h3Element.textContent.trim() : null;
        });
        if(!problemName){
            throw new Error('Problem name not found');
        }
        await browser.close();

        const newProblem = new Problem({
            name : problemName,
            problemUrl : problem.url,
            problemJudge : problem.judge,
            problemCode : problem.code
        });

        await newProblem.save();
    } catch(error) {
        console.log(error);
    }

}
const fetchCodeforcesProblem = async (problem) => {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.standings', {
            params : {
                contestId : problem.contestId,
                asManager : false,
                from : 1,
                count : 1,
                showUnofficial : true
            }
        });
        const problems = response.data.result.problems;
        (problems.map (async ( fetchedProblem )=>{
            const newProblem = new Problem({
                name: fetchedProblem.name,
                problemUrl: `https://codeforces.com/contest/${fetchedProblem.contestId}/problem/${fetchedProblem.index}`,
                problemJudge: 'codeforces',
                problemCode: fetchedProblem.contestId + fetchedProblem.index,
            })
            await newProblem.save();
        }))
    } catch (error) {
        console.log(error);
    }
    // contest case
}

exports.getProblem = async (req, res) => {
    try{
        const { problemId } = req.body;
        const problem = await Problem.findById(problemId);
        if(!problem){
            return response_401(res, "Problem not found");
        }
        return response_200(res, "Problem found succesfully", problem);
        
    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }
}

exports.deleteProblemFromSheet = async (req, res) => {
    try{
        const { sheetId, problemId } = req.body;
        if(!sheetId || !problemId){
            return response_400(res, "Missing required fields");
        }
        const sheet = await Sheet.findByIdAndUpdate(
            sheetId,
            { $pull : { problems : problemId} },
            { new : true }
        );

        if(!sheet){
            return response_404(res, "Sheet not found");
        }

        return response_200(res, "Problem deleted succesfully", sheet);
        
    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }  
}