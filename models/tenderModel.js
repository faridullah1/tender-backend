const Sequelize = require('sequelize');
const Joi = require('joi');

const db = require('../db');
const { Project } = require('./projectsModel');

const Tender = db.define('tender', 
{
	tenderId: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	tenderNumber: {
		type: Sequelize.STRING,
		allowNull: false
	},
	type: {
		type: Sequelize.STRING,
		allowNull: false
	},
	openingDate: {
		type: Sequelize.DATE,
		allowNull: false,
	},
	closingDate: {
		type: Sequelize.DATE,
		allowNull: false,
	},
	minimumPrice: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	maximumPrice: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	location: {							// Doha, Al Rayyan, Umm Salal, Al Khor & Al Thakira, Al Wakrah, Al Daayen, Al Shamal, and Al Shahaniya
		type: Sequelize.STRING,
		allowNull: false,
	},
	description: {
		type: Sequelize.STRING(1000),
		allowNull: false
	},
	documents: Sequelize.STRING,
	projectId: {
		type: Sequelize.INTEGER,
		allowNull: false,
		references: {
			model: Project,
			key: 'projectId',
			onDelete: 'RESTRICT'
		}
	}
});

function validateTender(tender) {
	const schema = Joi.object({
		tenderNumber: Joi.string().required(),
		type: Joi.string().required(),
		openingDate: Joi.date().required(),
		closingDate: Joi.date().required(),
		minimumPrice: Joi.number().required(),
		maximumPrice: Joi.number().required(),
		location: Joi.string().required(),
		description: Joi.string().required().max(1000),
		projectId: Joi.number().required(),
		documents: Joi.string(),
	});

	return schema.validate(tender);
}

exports.validate = validateTender;
exports.Tender = Tender;