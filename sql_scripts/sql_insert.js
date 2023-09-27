'use strict'

require('dotenv').config();
const app = require('../main.js');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const multer = require('multer');
const { sequelize, VehicleAttribute, Reservation } = require('./sql_tableDefinition');

app.use(bodyParser.json());

const storage= multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/insertVehicleData', upload.fields([{ name: 'imageData' }, {name: 'data' }]), (req, res) => {
	const imageFile = req.files['imageData'][0];
	const jsonData = JSON.parse(req.body['data']);
	console.log(jsonData);

	const directoryPath = './carImages/';
	const originalFilename = imageFile.originalname;
	const imageFileName = originalFilename;

	fs.writeFile(directoryPath + imageFileName, imageFile.buffer)
		.then(() => {
			jsonData.imageFileName = imageFileName;
			console.log('File saved successfully.');
			return VehicleAttribute.create(jsonData);
		})
		.then(() => {
			res.status(200).json({ message: 'Data inserted successfully.' });
		})
		.catch(error => {
			console.error('Error:', error);
			res.status(500).json({ error:'An error occurred.' });
		});
});

app.post('/insert_reservation_data', upload.fields([{ name: 'reservationData' }]), (req, res) => {
	const reservationData = JSON.parse(req.body.reservationData);
	return Reservation.create(reservationData);	
});

