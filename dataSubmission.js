'use strict'

const app = require('./main.js');
const { sequelize, VehicleAttribute } = require('./tableDefinition');

app.post('/dataSubmission', async (req, res) => {
	try {
		const allData = await VehicleAttribute.findAll();

		res.json(allData);

	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.' });
	}
});
