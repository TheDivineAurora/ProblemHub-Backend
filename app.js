const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const dotenv = require('dotenv');
const { response_400, response_401 } = require('./src/utils/responseCodes.utils');
const User = require("./src/models/user.models");
dotenv.config();

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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

authUser = async (user, password, done) => {
    if(!user || !password){
        done(null, false);
    }

    const userExists = await User.findOne({ username : user})
        .select("password email name")
        .exec();

    if(!userExists){
        done(null, false);
    }

    const passwordMatch = await userExists.comparePassword(password);

    if(!passwordMatch){
        done(null, false);
    }

    return done(null, {
        id: userExists._id,
        name: userExists.name, 
        email: userExists.email
    });
}

passport.use(new LocalStrategy (authUser));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
    async function(token, tokenSecret, profile, done){
        const userExists = await User.findOne({googleId: profile.id})
            .select("password username name email")
            .exec();
        // console.log(profile);

        if(!userExists){
            const newUser = new User({
                googleId: profile.id,
                email: profile.email,
                name: profile.displayName,
                username: "rand",
                profileImageUrl: profile.picture
            }); 

            const savedUser = await newUser.save();
            done(null, savedUser);
        }
        done(null, userExists);
    }
))
passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id);
    if(!user){
        done(null, false);
    }
    done(null, user);
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/auth/google",
    passport.authenticate('google', {
        scope:
            ['email', 'profile'],
    }
));

app.get("/auth/google/callback", 
    passport.authenticate('google',{
        failureRedirect: '/login',
    }),

    function(req, res){
        res.redirect('/dashboard');
    }
);

app.get('/login', (req, res) => {
    res.render("login.ejs");
})

app.post('/login', passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs', {name: req.user.name});
})