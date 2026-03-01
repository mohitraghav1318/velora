const mongoose = require('mongoose');
const Listing = require('../models/listing');
const initData = require('./data.js');

const MONGO_URI = 'mongodb://127.0.0.1:27017/veloraDB';

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
        owner: "699ab1c57f367eccd76f864c",
    }));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with data");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});