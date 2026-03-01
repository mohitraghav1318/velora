if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();
app.set("trust proxy", 1);

const dbURL = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 8080;

/* ======================
   START SERVER
====================== */

async function startServer() {
    try {
        // 1️⃣ Connect to MongoDB
        await mongoose.connect(dbURL);
        console.log("✅ Connected to MongoDB");

        // 2️⃣ View Engine
        app.engine("ejs", ejsMate);
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "views"));

        // 3️⃣ Basic Middleware
        app.use(express.static(path.join(__dirname, "public")));
        app.use(express.urlencoded({ extended: true }));
        app.use(methodOverride("_method"));

        // 4️⃣ Session Store
        const store = MongoStore.create({
            mongoUrl: dbURL,
            collectionName: "sessions",
        });

        store.on("error", (err) => {
            console.log("SESSION STORE ERROR", err);
        });

        app.use(session({
            store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            },
        }));

        app.use(flash());

        // 5️⃣ Passport
        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(User.authenticate()));
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());

        // 6️⃣ Global Locals (VERY IMPORTANT)
        app.use((req, res, next) => {
            res.locals.currUser = req.user || null;
            res.locals.success = req.flash("success");
            res.locals.error = req.flash("error");
            next();
        });

        // 7️⃣ Routes
        app.get("/", (req, res) => {
            res.redirect("/listings");
        });

        app.use("/listings", listingRouter);
        app.use("/listings/:id/reviews", reviewRouter);
        app.use("/", userRouter);

        // 8️⃣ 404
        app.use((req, res, next) => {
            next(new ExpressError(404, "Page Not Found"));
        });

        // 9️⃣ Error Handler
        app.use((err, req, res, next) => {
            const { statusCode = 500, message = "Something went Wrong!" } = err;
            res.status(statusCode).render("error.ejs", { statusCode, message });
        });

        // 🔟 Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
    }
}

startServer();