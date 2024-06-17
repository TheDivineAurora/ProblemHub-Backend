const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const User = require('./src/models/user.models.js');
const initializePassport = require('./passport.js');
const methodOverride = require('method-override');
dotenv.config();
initializePassport(passport);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: "secret",
    resave: false ,
    saveUninitialized: true ,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/register', checkNotAuthenicated, (req, res) => {
    const profile = req.session.tempUserProfile;
    res.render("register.ejs", {
        email: profile? profile.emails[0].value : '',
        isReadOnly: !!profile,
    });

})

app.post('/register', checkNotAuthenicated, async (req, res) => {
    
    try {
        const {email, password, username} = req.body;
        const googleProfile = req.session.tempUserProfile;
        const newUser = new User({
            username: username,
            email: email,
            password: password,
            googleId: googleProfile?.id,
        });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.redirect('/register');
    }
})

app.get('/login', checkNotAuthenicated, (req, res) => {
    if(req.isAuthenticated()) return res.redirect('/dashboard');
    res.render("login.ejs");
})

app.post('/login', checkNotAuthenicated, passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
}));

app.get('/auth/google', passport.authenticate('google', {scope : ['email', 'profile']}));

app.get('/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/login'}),
    (req, res) => {
        console.log("axa");
        if(!req.user){
            req.session.tempUserProfile = req.authInfo.profile;
            return res.redirect('/register');
        }
        return res.redirect('/dashboard');
    }
)

app.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});

app.get('/dashboard', checkAuthenicated, (req, res) => {
    res.render('dashboard.ejs', {name: req.user.username});
})

function checkAuthenicated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenicated(req, res, next){
    if(req.isAuthenticated()){
        res.redirect('/dashboard');
    }
    next();
}