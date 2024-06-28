const express = require("express");
const router = express.Router();
const passport = require('passport');
const upload = require('../middlewares/fileUpload.middlewares');
const { checkAuthenicated, checkNotAuthenicated } = require('../middlewares/auth.middlewares');
const { register } = require('../controllers/auth.controllers');



router.post('/register', upload.single('avatar'), register);

router.post('/login', checkNotAuthenicated, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
}));

router.get('/auth/google', passport.authenticate('google', {scope : ['email', 'profile']}));

router.get('/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/login', successRedirect: '/dashboard'}),
)

router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});

module.exports = router;