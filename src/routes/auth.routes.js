const express = require("express");
const router = express.Router();

const upload = require('../middlewares/fileUpload.middlewares');
const { register } = require('../controllers/auth.controllers');



router.post('/register', upload.single('avatar'), register);



module.exports = router;