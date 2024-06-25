const express = require("express");
const router = express.Router();
const {getUser, updateUser} = require('../controllers/user.controller');
const { checkAuthenicated } = require("../middlewares/auth.middlewares");

router.get('/', getUser);
router.patch('/',checkAuthenicated, updateUser);

module.exports = router;