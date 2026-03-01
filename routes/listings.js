const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require('../middlewware.js');


router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("./listings/index.ejs", { allListings });
}));

//new listing route to display a form to create a new listing
router.get('/new', isLoggedIn, (req, res) => {
    res.render("./listings/new.ejs");
});

//show route to display a single listing by id
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" },
        });

    res.render("./listings/show.ejs", { listing });
}));

//edit route 
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    res.render("./listings/edit.ejs", { listing });
}));

//create route 
router.post('/', isLoggedIn, validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save(
        );
        req.flash('success', 'Listing created successfully!');
        res.redirect('/listings');
    })
);

//update route to update a listing
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
}));

//delete route to delete a listing
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
}));

module.exports = router;