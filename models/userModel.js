const Sequelize = require('sequelize');
const Joi = require('joi');

const db = require('../db');

const User = db.define('user', 
{
	userId: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	mobileNumber: {
		type: Sequelize.STRING(11),
		allowNull: false,
		unique: true
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	type: {
		type: Sequelize.STRING,
		allowNull: false
	},
	isAdmin: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	isSuperAdmin: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
},
{
	defaultScope: {
		attributes: {
			exclude: ['password']
		}
	}
});

function validateUser(user) {
	const schema = Joi.object({
		name: Joi.string().required().min(3),
		email: Joi.string().required().email(),
		mobileNumber: Joi.string().required().min(11).max(11),
		password: Joi.string().required().min(8),
		type: Joi.string().required().valid('Client', 'Supplier', 'Contractor', 'Consultant')
	});

	return schema.validate(user);
}

exports.validate = validateUser;
exports.User = User;