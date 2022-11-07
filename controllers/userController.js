const Joi = require('Joi');

const { User, validate } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { generateRandomFourDigits, sendSMS } = require('../utils/helpers');

exports.getAllUsers = async (req, res, next) => {
	const users = await User.findAll();

	res.status(200).json({
		status: 'success',
		data: {
			users
		}
	});
};

exports.createUser = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const { name, email, mobileNumber, password, type } = req.body;
	const user = await User.create({ name, email, mobileNumber, password, type });
	
	res.status(201).json({
		status: 'success',
		data: user.userId
	});
});

exports.mobileOTPVerification = catchAsync( async(req, res, next) => {
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
	})
});

validateMobileNumber = (mobNumber) => {
	const schema = Joi.object({
		mobileNumber: Joi.string().required().min(13).max(13)
	});

	return schema.validate(mobNumber);
}