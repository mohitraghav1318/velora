const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { saveRedirectUrl } = require('../middlewware');

router.get('/signup', (req, res) => {
    return res.render("users/signup");
});

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Velora!");
            return res.redirect("/listings");   // ✅ RETURN ADDED
        });

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");        // ✅ RETURN ADDED
    }
});

router.get('/login', (req, res) => {
    return res.render("users/login");
});

router.post(
    '/login',
    saveRedirectUrl,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        req.flash('success', 'Welcome back!');
        return res.redirect(res.locals.redirectUrl || '/listings'); // ✅ RETURN ADDED
    }
);

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        return res.redirect('/listings'); // ✅ RETURN ADDED
    });
});

module.exports = router;