const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const Session = require('express-session');
const flash = require('connect-flash');

const listings = require('./routes/listings');
const reviews = require('./routes/review');

app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));  // to support PUT and DELETE methods via forms

const sessionOptions = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

const MONGO_URI = 'mongodb://127.0.0.1:27017/veloraDB';
main().then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URI);
}

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(Session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went Wrong!" } = err;
    res.status(statusCode).render('error.ejs', { statusCode, message });
});


app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/listings');
});