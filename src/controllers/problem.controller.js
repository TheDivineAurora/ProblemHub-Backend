const axios = require('axios')
const Problem = require('../models/problem.models')
const Sheet = require('../models/sheet.models')
const { response_400, response_200, response_500, response_401, response_404 } = require('../utils/responseCodes.utils');

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
            sheet.problems.push(problemExists._id);
            await sheet.save();
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
                contestId: fetchedProblem.contestId,
                problemIndex: fetchedProblem.index
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