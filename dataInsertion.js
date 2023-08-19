'use strict'

require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const multer = require('multer');
const { sequelize, VehicleAttribute } = require('./tableDefinition');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/insertVehicleData', upload.fields([{ name: 'imageData' }, {name: 'data' }]), (req, res) => {
	const imageFile = req.files['imageData'][0];
	const jsonData = JSON.parse(req.body['data']);

	const storage = multer.memoryStorage();
	const upload = multer({ storage:storage });

	const directoryPath = './carImages';

	if(jsonData && jsonData.act === 'insert_vehicleAttribute') {
		if (!imageFile) {
			console.log('failed to upload');
			res.status(400).send('No file uploded.');
			return;
		} else {
			const originalFilename = imageFile.originalname;
			const filePath = `${directoryPath}/${originalFilename}`;

			fs.writeFile(filePath, imageFile.buffer)
				.then(() => {
					jsonData.data.imagePath = filePath;
					console.log('File saved successfully.');
					return VehicleAttribute.create(jsonData.data);
				})
				.then(() => {
					res.status(200).json({ message: 'Data inserted successfully.' });
				})
				.catch(error => {
					console.error('Error:', error);
					res.status(500).json({ error:'An error occurred.' });
				});
		}
	} else {
		res.status(400).json({ error: 'Invalid action.' });
	}
});

app.listen(port, () => {
	console.log(`server listening on port ${port}🦻`);
});