const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const authRouter = require('./src/routes/auth.routes.js')
const sheetRouter = require('./src/routes/sheet.routes.js')
const problemRouter = require('./src/routes/problem.routes.js')
const initializePassport = require('./passport.js');
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

app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('', authRouter);
app.use('/problem', problemRouter);
app.use('/sheet', sheetRouter);