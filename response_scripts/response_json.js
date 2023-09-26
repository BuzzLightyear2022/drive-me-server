'use strict'

const app = require('../main.js');
const path = require('path');
const fs = require('fs');

app.post('/fetchCarCatalog', (req, res) => {
	const jsonFilePath = path.join('json_files', 'car_catalog.json');
	fs.readFile(jsonFilePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading JSON file:', err);
			res.status(500).send('Internal Server Error');
			return;
		}
		try {
			const jsonData = JSON.parse(data);
			res.json(jsonData);
		} catch(parseError) {
			console.error('Error parsing JSON:', parseError);
			res.status(500).send('Internal Server Error');
		}
	});
});
