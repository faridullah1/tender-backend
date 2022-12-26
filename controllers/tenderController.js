const { Project } = require('../models/projectsModel');
const { Tender, validate } = require('../models/tenderModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTenders = catchAsync(async (req, res, next) => {
	const tenders = await Tender.findAll({ includes: [{
		model: Project, attributes: ['name']
	}]});

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

	// Project can only be associated to SINGLE tender;
	const project = await Tender.findOne({ where: { projectId: req.body.projectId }});
	if (project) return next(new AppError('This project already has a tender', 400));

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