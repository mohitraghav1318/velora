const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const initData = require('./data.js');
const MONGO_URI = process.env.ATLASDB_URL

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await initDB();
    await mongoose.connection.close();
}

async function initDB() {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "69a4472be812d31cad74bc2d",
    }));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with data");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});