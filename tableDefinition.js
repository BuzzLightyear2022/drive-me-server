'use strict'

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const rds_host = process.env.RDS_HOST;
const rds_user = process.env.RDS_USER;
const rds_password = process.env.RDS_PASSWORD;

const sequelize = new Sequelize('drive_me_test_since20230703', rds_user, rds_password, {
	host: rds_host,
	dialect: 'mysql',
});

const VehicleAttribute = sequelize.define('VehicleAttribute', {
	imagePath: DataTypes.STRING,
	carModel: DataTypes.STRING,
	modelCode: DataTypes.STRING,
	nonSmoking: DataTypes.BOOLEAN,
	insurancePriority: DataTypes.BOOLEAN,
	licensePlateRegion: DataTypes.STRING,
	licensePlateCode: DataTypes.STRING,
	licensePlateHiragana: DataTypes.STRING,
	licensePlateNumber: DataTypes.STRING,
	bodyColor: DataTypes.STRING,
	driveType: DataTypes.STRING,
	transmission: DataTypes.STRING,
	grade: DataTypes.STRING,
	navigation: DataTypes.STRING,
	hasBackCamera: DataTypes.BOOLEAN,
	hasDVD: DataTypes.BOOLEAN,
	hasTelevision: DataTypes.BOOLEAN,
	hasExternalInput: DataTypes.BOOLEAN,
	hasSpareKey: DataTypes.BOOLEAN,
	otherFeatures: DataTypes.TEXT,
});

sequelize.sync()
	.then(() => {
		console.log('table is created.');
	})
	.catch ((err) => {
		console.error('failed to create a table:', err);
	});

sequelize.
	authenticate()
	.then(() => {
		console.log('Connected to the database🧑‍💻.');
	})  
	.catch((error) => {
		console.error('Unable to connect to the database:', error);
        }); 

module.exports = { sequelize, VehicleAttribute };
