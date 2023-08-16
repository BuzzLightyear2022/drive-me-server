'use strict'

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('drive_me_test_since20230703', 'root', 'WecwDOas3Rd9yQ7WKtPS', {
	host: 'drive-me-test-mysql.cc9wcoa99lea.ap-northeast-1.rds.amazonaws.com',
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
	otherFeatures: DataTypes.TEXT
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
