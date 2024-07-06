const express = require("express");
const router = express.Router();

const upload = require('../middlewares/fileUpload.middlewares');
const { register, login } = require('../controllers/auth.controllers');



router.post('/register', upload.single('avatar'), register);
router.post('/login', login);


module.exports = router;