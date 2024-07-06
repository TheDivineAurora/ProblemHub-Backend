const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require("cors");
const authRouter = require('./src/routes/auth.routes.js')
const userRouter = require('./src/routes/user.routes.js')
const sheetRouter = require('./src/routes/sheet.routes.js')
const problemRouter = require('./src/routes/problem.routes.js')
const cloudinary = require('cloudinary').v2;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secret",
    resave: false ,
    saveUninitialized: true ,
}));

app.use(cors());

app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/problem', problemRouter);
app.use('/sheet', sheetRouter);