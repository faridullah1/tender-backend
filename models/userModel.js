const Sequelize = require('sequelize');
const Joi = require('joi');

const db = require('../db');
const { UserCompany } = require('./userCompanyModel');

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
		type: Sequelize.STRING(10),
		allowNull: false,
		unique: true
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	isAccountActive: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	isEmailVerified: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	confirmationCode: Sequelize.STRING,
	type: {
		type: Sequelize.STRING,			// Possible Types are Client, Supplier, Contractor, Consultant, Super_Admin, Admin, Employee
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
	},
	company: {
		type: Sequelize.INTEGER,
		allowNull: true,
		references: {
			model: UserCompany,
			key: 'companyId',
			onDelete: 'RESTRICT'
		}
	}
});

function validateUser(user) {
	const schema = Joi.object({
		name: Joi.string().required().min(3),
		email: Joi.string().required().email(),
		mobileNumber: Joi.string().required().min(10).max(10),
		password: Joi.string().required().min(8),
		type: Joi.string().required().valid('Client', 'Supplier', 'Contractor', 'Consultant'),
	});

	return schema.validate(user);
}

exports.validate = validateUser;
exports.User = User;