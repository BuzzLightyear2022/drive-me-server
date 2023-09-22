'use strict'

const app = require('../main.js');
const { sequelize, VehicleAttribute } = require('./sql_tableDefinition');

class selectCarData {
	static selectAllCarAttribute = () => {
		app.post('/selectAllCarAttribute', async (req, res) => {
			try {
				const carAttribute = await VehicleAttribute.findAll({
					order: [
						['rentalClass', 'DESC'],
						['licensePlateNumber', 'DESC']
					]
				});
				res.json(carAttribute);
			} catch (error) {
				console.error('Error while fetching data:', error);
				res.status(500).json({ error: 'An error occurred while fetching data.' });
			}
		});
	}
	
	static selectRentalClasses = () => {
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
	}

	static selectCarModels = () => {
		app.post('/selectCarModels', async (req, res) => {
			try {
				const rentalClass = req.body.rentalClass;
				const nonSmoking = req.body.nonSmoking;
				if (nonSmoking == 0) {
					const carModels = await VehicleAttribute.findAll({
						attributes: ["carModel"],
						where: {
							nonSmoking: nonSmoking,
							rentalClass: rentalClass
						},
						group: ["carModel"]
					});
					res.json(carModels);
				} else if (nonSmoking == 1) {
					const carModels = await VehicleAttribute.findAll({
						attributes: ["carModel"],
						where: {
							nonSmoking: nonSmoking,
							rentalClass: rentalClass
						},
						group: ["carModel"]
					});
					res.json(carModels);
				} else {
					const carModels = await VehicleAttribute.findAll({
						attributes: ["carModel"],
						where: {
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
	}
	static selectLicensePlateAndCarData = () => {
		app.post('/selectLicensePlateAndCarData', async (req, res) => {
			try {
				const rentalClass = req.body.rentalClass;
				const nonSmoking = req.body.nonSmoking;
				const carModel = req.body.carModel;

				if (nonSmoking == 0) {
					const licensePlateAndCarData = await VehicleAttribute.findAll({
						Attributes: [
							"id",
							"imageFileName",
							"licensePlateRegion",
							"licensePlateCode",
							"licensePlateHiragana",
							"licensePlateNumber"
						],
						where: {
							rentalClass: rentalClass,
							nonSmoking: nonSmoking
						}
					});
					res.json(licensePlateAndCarData);
				} else if (nonSmoking == 1) {
					const licensePlateAndCarData = await VehicleAttribute.findAll({
						Attributes: [
							"id",
							"imageFileName",
							"licensePlateRegion",
							"licensePlateCode",
							"licensePlateHiragana",
							"licensePlateNumber"
						],
						where: {
							rentalClass: rentalClass,
							nonSmoking: nonSmoking
						}
					});
					res.json(licensePlateAndCarData);

				} else {
					const licensePlateAndCarData = await VehicleAttribute.findAll({
						Attributes: [
							"id",
							"imageFileName",
							"licensePlateRegion",
							"licensePlateCode",
							"licensePlateHiragana",
							"licensePlateNumber"
						],
						where: {
							carModel: carModel,
							rentalClass: rentalClass,
						}
					});
					res.json(licensePlateAndCarData);
				}
			} catch (error) {
				console.error('Error while fetching data:', error);
				res.status(500).json({ error: 'An error occurred while fetching data.' });
			}
		});
	}
}

selectCarData.selectAllCarAttribute();
selectCarData.selectRentalClasses();
selectCarData.selectCarModels();
selectCarData.selectLicensePlateAndCarData();
