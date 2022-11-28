const Joi = require('Joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User, validate } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { generateRandomFourDigits, sendSMS, sendEmail } = require('../utils/helpers');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res, next) => {
	const userType = req.query.type;
	const where = {};

	if (userType) {
		let operator = 'eq';
		if (typeof userType === 'object') {
			operator = Object.keys(userType)
		}

		where['type'] = {
			[Op[operator]]: 'Admin'
		};
	}
	
	const users = await User.findAll({ where });

	res.status(200).json({
		status: 'success',
		data: {
			users
		}
	});
};

exports.getUser = catchAsync(async (req, res, next) => {
	const userId = req.params.id;
	const user = await User.findOne({ where: { userId }});

	if (!user) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	});
});

exports.createUser = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const token = jwt.sign({ email: req.body.email }, process.env.JWT_PRIVATE_KEY);

	const { name, email, mobileNumber, password, type } = req.body;

	const salt = await bcrypt.genSalt(10);
	const encryptedPassword = await bcrypt.hash(password, salt);

	const user = await User.create({ 
		name, email, mobileNumber, 
		password: encryptedPassword, type, confirmationCode: token 
	});

	// Don't need email verification incase admin add user;
	if (req.body.fromAdmin) {
		user.isAccountActive = true;
		await user.save();
	}
	else {
		const emailOptions = {
			email: email,
			subject: 'Please confirm your account',
			html:  `<h1>Email Confirmation</h1>
				<h2>Hi, ${name}</h2>
				<p>Thank you for registering with Wissal. Please confirm your email by clicking on the following link</p>
				<a href=http://localhost:4200/confirm/${token}> Click here</a>
			</div>`
		};
	
		await sendEmail(emailOptions);
	}
	
	res.status(201).json({
		status: 'success',
		data: user.userId,
		message: 'User was registered successfully! Please check your email'
	});
});

exports.createSuperAdmin = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const { name, email, mobileNumber, password, type } = req.body;

	const salt = await bcrypt.genSalt(10);
	const encryptedPassword = await bcrypt.hash(password, salt);

	const user = await User.create({ 
		name, email, mobileNumber, 
		password: encryptedPassword, type,
		isSuperAdmin: true,
		isAdmin: true
	});
	
	res.status(201).json({
		status: 'success',
		data: {
			user
		}
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	const userId = req.params.id;
	const user = await User.update(req.body, { where: { userId }});

	if (!user) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	const userId = req.params.id;
	const user = await User.destroy({ where: { userId }});

	if (!user) return next(new AppError('No record found with given Id', 404));

	res.status(204).json({
		status: 'success',
		data: {
			user
		}
	});
});

exports.verifyUser = catchAsync(async(req, res, next) => {
	const confirmationCode = req.params.confirmationCode;
	console.log('code =', confirmationCode);
	const user = await User.findOne({ where: { confirmationCode }});

	if (!user) return next(new AppError('User not found', 404));

	user.isAccountActive = true;
	await user.save();

	res.status(200).json({
		status: 'success',
		data: {
			message: "Account verified"
		}
	});
});

exports.mobileOTPVerification = catchAsync(async(req, res, next) => {
	const { error } = validateMobileNumber(req.body);
	if (error) return next(new AppError(error.message, 400));

	const verificationCode = generateRandomFourDigits();
	const text = `Your Wissal Verification code is:\n${verificationCode}`;
	const mobileNumber = '+92' + req.body.mobileNumber;

	const output = await sendSMS(mobileNumber, text);

	res.status(200).json({
		status: 'success',
		data: {
			code: verificationCode,
			text: JSON.parse(output.text)
		}
	});
});

exports.sendEmail = catchAsync( async(req, res, next) => {
	const options = {
		email: 'faridullah996@gmail.com',
		subject: 'Testing',
		message: 'Testing email message'
	};

	const emailResp = await sendEmail(options);

	res.status(200).json({
		status: 'success',
		data: {
			emailResp
		}
	});
});

validateMobileNumber = (mobNumber) => {
	const schema = Joi.object({
		mobileNumber: Joi.string().required().min(10).max(10)
	});

	return schema.validate(mobNumber);
}