const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	let { dataValues:user } = await User.findOne({ where: { email: req.body.email } });
	if (!user) return next(new AppError('Invalid email or password.', 400));

	// Check if user type is the same as the one stored against email
	if (user.type !== req.body.type) return next(new AppError(`User of type ${req.body.type} does not exists`, 400));

	// Check if user email is verified
	if (!user.isAccountActive) return next(new AppError('User email is not verified', 400));

	const isValid = await bcrypt.compare(req.body.password, user.password);
	if (!isValid) return next(new AppError('Invalid email or password.', 400));

	const token  = jwt.sign({ id: user.id, name: user.name, email: user.email, type: user.type }, process.env.JWT_PRIVATE_KEY, {
		expiresIn: process.env.JWT_EXPIRY
	});

	res.status(200).json({
		status: 'success',
		access_token: token
	});
});

exports.adminLogin = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	let user = await User.findOne({ where: { [Op.and]: [{ email: req.body.email }, { isSuperAdmin: true }, { type: 'Admin' }] } });
	if (!user) return next(new AppError('Invalid email or password.', 400));

	const isValid = await bcrypt.compare(req.body.password, user.password);
	if (!isValid) return next(new AppError('Invalid email or password.', 400));

	const token  = jwt.sign({ id: user.id, name: user.name, email: user.email, isSuperAdmin: true }, process.env.JWT_PRIVATE_KEY, {
		expiresIn: process.env.JWT_EXPIRY
	});

	res.status(200).json({
		status: 'success',
		access_token: token
	});
});

function validate(req) {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		type: Joi.string().required()
	});

	return schema.validate(req); 
}