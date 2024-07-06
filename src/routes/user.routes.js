const express = require("express");
const router = express.Router();
const {getUser, updateUser, getSessionUser} = require('../controllers/user.controller');
const { checkAuthenicated } = require("../middlewares/auth.middlewares");

router.get('/', getUser);
router.get('/profile', checkAuthenicated, getSessionUser);
router.patch('/',checkAuthenicated, updateUser);
module.exports = router;