'use strict'

const app = require('./main.js');
const { sequelize, VehicleAttribute } = require('./tableDefinition');

app.post('/fetchVehicleData', async (req, res) => {
	try {
		const allData = await VehicleAttribute.findAll();
		res.json(allData);

	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.' });
	}
});

app.post('/fetchRentalClass', async (req, res) => {
	try {
		const dataByRentalClass = await VehicleAttribute.findAll({
			attributes: ['rentalClass', [sequelize.fn('COUNT', sequelize.col('rentalClass')), 'count']],
			group: ['rentalClass'],
		});

		res.json(dataByRentalClass);
	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.' });
	}
});

app.post('/fetchCarModel', async (req, res) => {
	try {
		const rentalClass = req.body.rentalClass;
		const carModels = await VehicleAttribute.findAll({
			attributes: ["carModel"],
			where: {
				rentalClass: rentalClass,
			},
			group: ['carModel'],
		});

		res.json(carModels);
	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.'});
	}
});

app.post('/fetchLicensePlate', async (req, res) => {
	try {
		const carModel = req.body.carModel;
		const licensePlate = await VehicleAttribute.findAll({
			attributes: ["licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
			where: {
				carModel: carModel
			}
		});
		res.json(licensePlate);
	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.' });
	}
});
