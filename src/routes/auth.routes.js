const express = require("express");
const router = express.Router();
const passport = require('passport');
const {checkAuthenicated, checkNotAuthenicated} = require('../middlewares/auth.middlewares')
router.get('/register', checkNotAuthenicated, (req, res) => {
    res.render("register.ejs");
})

router.post('/register', async (req, res) => {
    try {
        const {email, password, username} = req.body;
        const newUser = new User({
            username: username,
            email: email,
            password: password,
        });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.redirect('/register');
    }
})

router.get('/login', checkNotAuthenicated, (req, res) => {
    res.render("login.ejs");
})

router.post('/login', checkNotAuthenicated, passport.authenticate('local', {
    successRedirect: "/dashboard",
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

router.get('/dashboard', checkAuthenicated, (req, res) => {
    res.render('dashboard.ejs', {name: req.user.username});
})

module.exports = router;