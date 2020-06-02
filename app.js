const express = require('express');
require('dotenv').config();
require('./db');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/user', routes);

const PORT = process.env.PORT || 3000

app.listen(3000, () => {
    console.log(`Listening on port ${PORT}`)
});