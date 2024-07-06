const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        validate : {
            validator: function(v) {
                return /^[a-zA-Z ]+$/.test(v);
            },
            message: (name) => `${name} is not a valid name!`,
        },
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: (email) => `${email.value} is not a valid email address!`,
        },
    },
    password: {
        type: String,
        select: false,
        minLength: [8, "Password must be atleast 8 characters"],
    },

    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exist"],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]+$/.test(v);
            },
            message: (username) => `${username.value} is not a valid username!`,
        },
    },
    googleId: {
        type: String
    },

    profileImageUrl: {
        type: String,
        default: "",
    },
    sheets : [
        {
            type: mongoose.Schema.ObjectId,
            ref: "sheets"
        }
    ] 

})

UserSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateToken = async function() {
    return await jwt.sign({_id : this._id}, process.env.JWT_KEY, {
        expiresIn: "7d",
    });
};

module.exports = mongoose.model("users", UserSchema);