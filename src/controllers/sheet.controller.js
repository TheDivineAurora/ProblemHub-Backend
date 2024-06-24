const Sheet = require('../models/sheet.models');
const User = require('../models/user.models');
const { response_200, response_500, response_401, response_400, response_404 } = require('../utils/responseCodes.utils');

exports.createSheet = async (req, res) => {
    try{
        const {name, userId} = req.body;

        const user = await User.findById(userId);
        if(!user){
            return response_404(res, "User not found");
        }

        const sheet = new Sheet({
            name: name,
            createdBy: userId
        });
        await sheet.save();

        user.sheets.push(sheet._id);
        await user.save();
        
        return response_200(res, "Sheet created succesfully", sheet);

    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }
}

exports.getSheet = async (req, res) => {
    try{
        const {sheetId} = req.body;
        const sheet = await Sheet.findById(sheetId);
        if(!sheet){
            return response_404(res, "Sheet not found");
        }
        return response_200(res, "Sheet found succesfully", sheet);
        
    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }
}
exports.deleteSheet = async (req, res) => {
    try{
        const {sheetId} = req.body;
        const sheet = await Sheet.findByIdAndDelete(sheetId);
        if(!sheet){
            return response_404(res, "Sheet not found");
        }
        return response_200(res, "Sheet deleted succesfully", sheet);
        
    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }
}
exports.updateSheet = async (req, res) => {
    try{
        const { sheetId, name} = req.body;
        const sheet = await Sheet.findByIdAndUpdate(sheetId, { name }, {new: true});
        if(!sheet){
            return response_404(res, "Sheet not found");
        }
        return response_200(res, "Sheet updated successfully", sheet);
        
    } catch(error){
        console.log(error);
        return response_500(res, "Internal server error!");
    }
}
