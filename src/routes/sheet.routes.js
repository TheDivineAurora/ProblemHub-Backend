const express = require("express");
const router = express.Router();
const { createSheet, getSheet, deleteSheet, updateSheet } = require('../controllers/sheet.controller');



router.post('/', createSheet);
router.get('/', getSheet);
router.delete('/', deleteSheet);
router.patch('/', updateSheet);

module.exports = router;