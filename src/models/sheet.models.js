const { default: mongoose } = require("mongoose");
const SheetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Required"],
        unique: [true, "Problem Name already exists!"]
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        required: [true, "Sheet must belong to a user"]
    },
    problems: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "problems"
        }
    ]
})

module.exports = mongoose.model("sheets", SheetSchema);