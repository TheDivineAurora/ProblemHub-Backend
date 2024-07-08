const express = require("express");
const router = express.Router();

const upload = require('../middlewares/fileUpload.middlewares');
const { register, login, logout } = require('../controllers/auth.controllers');

router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;