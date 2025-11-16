const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js');

app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const MONGO_URI = 'mongodb://127.0.0.1:27017/veloraDB';
main().then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URI);
}

app.get('/', (req, res) => {
    res.send('Hello World');
});

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));  // to support PUT and DELETE methods via forms


//index route to display all listings
app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

//new listing route to display a form to create a new listing
app.get('/listings/new', (req, res) => {
    res.render("./listings/new.ejs");
});


//show route to display a single listing by id
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
}));


//create route 
app.post('/listings', validateListing, express.urlencoded({ extended: true }),
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body);
        if (!newListinng.description)
            await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    })
);

//edit route 
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}));

//update route to update a listing
app.put('/listings/:id', validateListing, express.urlencoded({ extended: true }), wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body);
    res.redirect(`/listings/${id}`);
}));

//delete route to delete a listing
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));


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