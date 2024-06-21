const { default: mongoose } = require("mongoose");
const ProblemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Required"],
        unique: [true, "Problem Name already exists!"]
    },
    problemUrl: {
        type: String,
        required: [true, "Problem Url is Required"]
    },
    problemJudge: {
        type: String,
        required: [true, "problem judge is required"]
    }
})


module.exports = mongoose.model("problems", ProblemSchema);