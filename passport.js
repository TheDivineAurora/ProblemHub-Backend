const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require("./src/models/user.models");

function initialize(passport) {
    authUser = async (user, password, done) => {
        if(!user || !password){
            return done(null, false);
        }
        const userExists = await User.findOne({username : user})
            .select("username email password")
            .exec();
        if(!userExists){
            return done(null, false); 
        }
        const passwordMatch = await userExists.comparePassword(password);
    
        if(!passwordMatch){
            return done(null, false);
        }
        done(null, {
            id: userExists._id,
            username: userExists.username,
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
        try{
            const userExists = await User.findOne({googleId: profile.id});
            if(!userExists){
                console.log(profile)
                return done(null, false, {profile});
            }
            else{
                return done(null, userExists);
            }
        }
        catch(error){
            return done(err, false)
        }
    }
    ));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async(id, done) => {
        const user = await User.findById(id);
        if(!user){
            return done(null, false);
        }
        done(null, user);
    });
}


module.exports = initialize;