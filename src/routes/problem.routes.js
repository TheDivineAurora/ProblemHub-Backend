const express = require("express");
const { addProblemToSheet, getProblem } = require("../controllers/problem.controller");
const { deconstructUrl } = require("../middlewares/problem.middlewares");
const router = express.Router();

router.post('/',deconstructUrl ,addProblemToSheet);
router.get('/', getProblem);
module.exports = router;