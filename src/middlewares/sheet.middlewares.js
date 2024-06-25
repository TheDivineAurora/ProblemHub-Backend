const Sheet = require("../models/sheet.models");
const { response_404, response_401, response_400 } = require("../utils/responseCodes.utils");


exports.checkSheetOwner = async (req, res, next) => {
    const { sheetId } = req.body;
    if(!sheetId) {
        return response_400(res, "Missing required fields");
    }

    const sheet = Sheet.findById(sheetId);
    if(!sheet){
        return response_404(res, "Sheet not found");
    }

    if(!sheet.createdBy.equals(req.session.id)){
        return response_401(res, "You are not the Sheet owner");
    }

    next();
}