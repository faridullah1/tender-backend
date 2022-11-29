const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../db');

const Project = db.define('project', 
{
	projectId: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	location: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	image: {
		type: Sequelize.STRING,
		allowNull: false,
	}
});

function validateUser(project) {
	const schema = Joi.object({
		name: Joi.string().required(),
		location: Joi.string().required(),
		image: Joi.string().required()
	});

	return schema.validate(project);
}

exports.validate = validateUser;
exports.Project = Project;