const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middlewware.js');


// post review routes
router.post('/', validateReview, isLoggedIn, wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);


    await newReview.save();
    await listing.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/listings/${listing._id}`);


}));

//delete review route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    return res.redirect(`/listings/${id}`);
}));

module.exports = router;
