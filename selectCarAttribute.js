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

app.post('/selectRentalClasses', async (req, res) => {
	try {
		const groupByRentalClass = await VehicleAttribute.findAll({
			attributes: ['rentalClass'],
			group: ['rentalClass'],
		});

		res.json(groupByRentalClass);
	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.' });
	}
});

app.post('/selectCarModels', async (req, res) => {
	try {
		const rentalClass = req.body.rentalClass;
		const nonSmoking = req.body.nonSmoking;
		if (nonSmoking === 'none-specification') {
			const carModels = await VehicleAttribute.findAll({
				attributes: ["carModel"],
				where: {
					rentalClass: rentalClass,
				},
				group: ['carModel'],
			});
			res.json(carModels);
		} else if (nonSmoking === 'non-smoking') {
			const carModels = await VehicleAttribute.findAll({
				attributes: ["carModel"],
				where: {
					nonSmoking: 1,
					rentalClass: rentalClass
				},
				group: ["carModel"]
			});
			res.json(carModels);
		} else if (nonSmoking === 'ok-smoking') {
			const carModels = await VehicleAttribute.findAll({
				attributes: ["carModel"],
				where: {
					nonSmoking: 0,
					rentalClass: rentalClass
				},
				group: ["carModel"]
			});
			res.json(carModels);
		}
	} catch (error) {
		console.error('Error while fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data.'});
	}
});

app.post('/fetchLicensePlate', async (req, res) => {
	try {
		const carModel = req.body.carModel;
		const licensePlate = await VehicleAttribute.findAll({
			ttributes: ["imageFileName", "licensePlateRegion", "licensePlateCode", "licensePlateHiragana", "licensePlateNumber"],
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
