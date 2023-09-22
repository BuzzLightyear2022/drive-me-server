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

const responseJson = require('./response_scripts/response_json.js');
const sqlTableDefinition = require('./sql_scripts/sql_tableDefinition.js');
const sqlInsert = require('./sql_scripts/sql_insert.js');
const sqlSelect = require('./sql_scripts/sql_select.js');
