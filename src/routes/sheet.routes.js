const express = require("express");
const router = express.Router();
const { createSheet, getSheet, deleteSheet, updateSheet, cloneSheet } = require('../controllers/sheet.controller');
const { checkAuthenicated } = require("../middlewares/auth.middlewares");
const { checkSheetOwner } = require("../middlewares/sheet.middlewares");

router.post('/', checkAuthenicated, createSheet);
router.post('/clone', checkAuthenicated, cloneSheet);
router.get('/', getSheet);
router.delete('/', checkAuthenicated, checkSheetOwner, deleteSheet);
router.patch('/', checkAuthenicated, checkSheetOwner, updateSheet);

module.exports = router;