const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.once('open', () => {
    console.log('Mongoose default connection open');
});

db.on('error', () => {
    console.log('An error occurred while connectiong to database');
});