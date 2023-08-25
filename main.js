'use strict'

require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Server listening on port ${port}.`);
});

module.exports = app;

const responseJson = require('./responseJson.js');
const tableDefinition = require('./tableDefinition.js');
const dataInsertion = require('./dataInsertion.js');
