const express = require("express");
const { addProblemToSheet, getProblem, deleteProblemFromSheet } = require("../controllers/problem.controller");
const { deconstructUrl } = require("../middlewares/problem.middlewares");
const { checkAuthenicated } = require("../middlewares/auth.middlewares");
const { checkSheetOwner } = require("../middlewares/sheet.middlewares");
const router = express.Router();

router.post('/',  deconstructUrl, addProblemToSheet);
router.get('/', getProblem);
router.delete('/', checkAuthenicated, checkSheetOwner, deleteProblemFromSheet);

module.exports = router;