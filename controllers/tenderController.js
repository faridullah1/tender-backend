// 3rd party packages
const multer = require('multer');
const schedule = require('node-schedule');

// Models
const { Bidding } = require('../models/biddingModel');
const { UserNotification } = require('../models/notificationModel');
const { Project } = require('../models/projectsModel');
const { Tender, validate } = require('../models/tenderModel');
const { UserCompany } = require('../models/userCompanyModel');
const { User } = require('../models/userModel');

// Utils
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../utils/helpers');
const uploadToS3 = require('../utils/s3Upload');

async function markTenderAsClosed(tenderId) {
	const tenderToClose = await Tender.findByPk(tenderId);
	
	if (tenderToClose) {
		tenderToClose.status = 'Under Evaluation';
		await tenderToClose.save();
	}
}

const upload = multer({
	dest: 'temp/'
});

exports.uploadDocs = upload.single('documents');

exports.getAllTenders = catchAsync(async (req, res, next) => {
	const tenders = await Tender.findAll({ include: [
		{
			model: Project, attributes: ['name']
		},
		{
			model: User, attributes: ['userId', 'name'],
			include: { model: UserCompany }
		}
	]});

	res.status(200).json({
		status: 'success',
		data: {
			tenders
		}
	});
});

exports.getTender = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;
	const tender = await Tender.findByPk(tenderId);
	const participants = await Bidding.count({ where: { tenderId } });

	if (!tender) return next(new AppError('No record found with given Id', 404));

	tender.dataValues.noOfParticipants = participants;

	res.status(200).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.createTender = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	if (req.file) {
		req.body.documents = await uploadToS3(req.file, 'tender-documents');
	}

	const { tenderNumber, type, openingDate, closingDate, minimumPrice, maximumPrice, location, description, projectId, documents } = req.body;

	const tender = await Tender.create({ 
		tenderNumber,
		type,
		openingDate,
		closingDate,
		minimumPrice,
		maximumPrice,
		location, 
		description,
		projectId,
		documents
	});

	const tenderId = tender.dataValues.tenderId;

	const job = schedule.scheduleJob(closingDate, async function() {
		await markTenderAsClosed(tenderId);
		console.log(`Tender with id = ${tenderId} mark as closed`);
	}.bind(null, tenderId));
	
	res.status(201).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.updateTender = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;
	const tender = await Tender.update(req.body, { where: { tenderId }});

	if (!tender) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.deleteTender = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;
	const tender = await Tender.destroy({ where: { tenderId }});

	if (!tender) return next(new AppError('No record found with given Id', 404));

	res.status(204).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.awardTender = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;

	const userId = req.body.awardedTo;
	const company = req.body.company;

	const user = await User.findByPk(userId);
	const tender = await Tender.update({ awardedTo: userId, status: `Awarded to ${company}`}, { where: { tenderId }});

	const emailContent = `Congratulations, we are pleased to let you know that your company "${company}" has been selected for project`;
	const emailOptions = {
		email: user.email,
		subject: 'Awarded with tender',
		html:  `
			<h2>Hi, ${user.name}</h2>
			<p>${emailContent}</p>
		</div>`
	};

	await UserNotification.create({  userId: user.userId, type: 'email', content: emailContent, senderId: req.user.userId });
	await sendEmail(emailOptions);
	
	res.status(200).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.unAwardTender = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;

	const tender = await Tender.update({ awardedTo: null, status: `Under Evaluation`}, { where: { tenderId }});
		
	res.status(200).json({
		status: 'success',
		data: {
			tender
		}
	});
});

exports.tenderBids = catchAsync(async (req, res, next) => {
	const tenderId = req.params.id;

	const bids = await Bidding.findAll({ 
		where: { tenderId }, 
		include: { model: User, include: { model: UserCompany, required: false }
	}});

	res.status(200).json({
		status: 'success',
		data: {
			bids
		}
	});
});