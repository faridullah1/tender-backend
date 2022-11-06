const { User, validate } = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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