const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing');
const { listingSchema } = require('../schema.js');

//middleware to validate listing data
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

//index route to display all listings
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

//new listing route to display a form to create a new listing
router.get('/new', (req, res) => {
    res.render("./listings/new.ejs");
});

//show route to display a single listing by id
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render("./listings/show.ejs", { listing });
}));

//edit route 
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render("./listings/edit.ejs", { listing });
}));

//create route 
router.post('/', validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save(
        );
        req.flash('success', 'Listing created successfully!');
        res.redirect('/listings');
    })
);

//update route to update a listing
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
}));

//delete route to delete a listing
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
}));

module.exports = router;