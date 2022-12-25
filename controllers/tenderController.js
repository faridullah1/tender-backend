const { Tender, validate } = require('../models/tenderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTenders = catchAsync(async (req, res, next) => {
	const tenders = await Tender.findAll();

	res.status(200).json({
		status: 'success',
		data: {
			tenders
		}
	});
});

exports.createTender = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const { tenderNumber, type, openingDate, closingDate, minimumPrice, maximumPrice, location, description, projectId } = req.body;

	const tender = await Tender.create({ 
		tenderNumber,
		type,
		openingDate,
		closingDate,
		minimumPrice,
		maximumPrice,
		location, 
		description,
		projectId
	});
	
	res.status(201).json({
		status: 'success',
		data: {
			tender
		}
	});
});