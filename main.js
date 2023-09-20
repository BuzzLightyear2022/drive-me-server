'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use('/publicImages', express.static('carImages'));
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Server listening on port ${port}.`);
});

module.exports = app;

const responseJson = require('./responseJson.js');
const tableDefinition = require('./tableDefinition.js');
const dataInsertion = require('./dataInsertion.js');
const selectCarAttribute = require('./selectCarAttribute.js');
