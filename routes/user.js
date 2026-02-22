const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

router.get('/signup', (req, res) => {
    res.render("users/signup");
});

router.post('/signup', wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let user = new User({ username, email });
        let registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome to Velora!');
        res.redirect('/listings');
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

}));

router.get('/login', (req, res) => {
    res.render("users/login");
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/listings');
}));

module.exports = router;