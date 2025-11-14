const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));  // to support PUT and DELETE methods via forms


//index route to display all listings
app.get('/listings', async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
});

//new listing route to display a form to create a new listing
app.get('/listings/new', (req, res) => {
    res.render("./listings/new.ejs");
});


//show route to display a single listing by id
app.get('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
});


//create route to create a new listing
app.post('/listings', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        next(err);
    }
});

//edit route to display a form to edit a listing
app.get('/listings/:id/edit', async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
});

//update route to update a listing
app.put('/listings/:id', express.urlencoded({ extended: true }), async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body);
    res.redirect(`/listings/${id}`);
});

//delete route to delete a listing
app.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
});

app.use((err, req, res, next) => {
    res.send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/listings');
});