'use strict'

require('dotenv').config();
const express = require('express');
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
	console.log('jsonData:', jsonData);
	console.log('imageDataSize:', imageFile.buffer.length);
	/* const data = req.body;
	console.log('Received data:', data);
	if(data && data.act === 'insert_vehicleAttribute') {
		VehicleAttribute.create(data.data)
			.then(() => {
				res.status(200).json({ message: 'Data inserted successfully.' });
			})
			.catch((error) => {
				console.error('Error inserting data:', error);
				res.status(500).json({ error: 'Error inserting data.' });
			});
	} else {
		res.status(400).json({ error: 'Invalid action.' });
	}
	*/
});

app.listen(port, () => {
	console.log(`server listening on port ${port}🦻`);
});
