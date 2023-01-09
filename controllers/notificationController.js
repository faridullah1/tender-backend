// Models
const { Notification, validate } = require('../models/notificationModel');

// Utils
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllNotifications = catchAsync(async (req, res, next) => {
	const userId = req.query.userId;

	const notifications = await Notification.findAll({ where: { userId }});

	res.status(200).json({
		status: 'success',
		data: {
			notifications
		}
	});
});

exports.createNotification = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const {userId, type, content } = req.body;
	const notification = await Notification.create({ userId, type, content });
	
	res.status(201).json({
		status: 'success',
		data: {
			notification
		}
	});
});
