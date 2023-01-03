const moment = require("moment/moment");
const schedule = require('node-schedule');

const { Bidding, validate } = require("../models/biddingModel");
const { Tender } = require("../models/tenderModel");
const { User } = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { sendEmail } = require("../utils/helpers");

exports.getAllBids = catchAsync(async (req, res, next) => {
	const bids = await Bidding.findAll({ include: [
		{ 
			model: User, attributes: ['name', 'mobileNumber'] 
		},
		{
			model: Tender, attributes: ['tenderNumber']
		}]});

	res.status(200).json({
		status: 'success',
		data: {
			bids
		}
	});
});

exports.participateInBidding = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	const tender = await Tender.findByPk(req.body.tenderId);
	if (!tender) return next(new AppError('Could not found tender with the given Id', 404));

	// Check tender's opening and closing dates
	const currentTime = new Date().getTime();
	const tenderOpeningTime = new Date(tender.openingDate).getTime();
	const tenderClosingTime = new Date(tender.closingDate).getTime();

	console.log(moment(currentTime).format('M/D/YYYY, H:mm:ss A'));
	console.log(moment(tenderOpeningTime).format('M/D/YYYY, H:mm:ss A'));
	console.log(moment(tenderClosingTime).format('M/D/YYYY, H:mm:ss A'));

	if (!(currentTime > tenderOpeningTime && currentTime < tenderClosingTime)) {
		return next(new AppError('Can not participate in tender bidding.', 400));
	}
	
	const user = await User.findByPk(req.body.userId);
	if (!['Consultant', 'Contractor', 'Supplier'].includes(user.type)) {
		return next(new AppError("You don't have permission to perform this actions", 403));
	}

	const lastTenMinutes = moment(tenderClosingTime).subtract(10, 'minutes');
	console.log('Last 10 minutes ', moment(lastTenMinutes).format('M/D/YYYY, H:mm:ss A'));

	if (moment(lastTenMinutes).isSameOrAfter(currentTime)) 
	{
		const scheduleEmailDate = new Date(lastTenMinutes);
		const job = schedule.scheduleJob(scheduleEmailDate, async function() {
			console.log(`Sending email at ${moment(scheduleEmailDate).format('M/D/YYYY, H:mm:ss')} to user ${user.name.toUpperCase()}`);

			const emailOptions = {
				email: user.email,
				subject: 'Bidding Time Arrived',
				html:  `
					<h2>Hi, ${user.name}</h2>
					<p>Please submit your bidding info</p>
				</div>`
			};
		
			await sendEmail(emailOptions);
		}.bind(null, user));

		const emailOptions = {
			email: 'faridullah996@gmail.com',
			subject: 'Bidding Participation',
			html:  `
				<h2>Hi, ${user.name}</h2>
				<p>Thanks for participating in the bidding, you will notified using email and SMS when bidding time arrives</p>
			</div>`
		};
	
		await sendEmail(emailOptions);

		const { tenderId, userId} = req.body;

		const bid = await Bidding.create({ 
			tenderId, userId
		});
	
		res.status(201).json({
			status: 'success',
			data: {
				bid
			}
		});
	}
	else {
		const { tenderId, userId, durationInLetters, durationInNumbers, priceInLetters, priceInNumbers } = req.body;
		
		let status = 'Not_Qualified';
		if (priceInNumbers > tender.minimumPrice && priceInNumbers < tender.maximumPrice) {
			status = 'Qualified';
		}

		const bid = await Bidding.create({ 
			tenderId, 
			userId, 
			durationInLetters, 
			durationInNumbers, 
			priceInLetters, 
			priceInNumbers,
			status
		});
	
		res.status(201).json({
			status: 'success',
			data: {
				bid
			}
		});
	}
});

exports.updateBid = catchAsync(async (req, res, next) => {
	const biddingId = req.params.id;

	const bidding = await Bidding.findByPk(biddingId);
	if (!bidding) return next(new AppError('Could not find bid with the given Id', 404));

	const tender = await Tender.findByPk(bidding.dataValues.tenderId);
	if (!tender) return next(new AppError('Could not find bid with the given Id', 404));

	let status = 'Not_Qualified';
	if (req.body.priceInNumbers > tender.minimumPrice && req.body.priceInNumbers < tender.maximumPrice) {
		status = 'Qualified';
	}
	req.body.status = status;

	const bid = await Bidding.update(req.body, { where: { biddingId }});

	res.status(200).json({
		status: 'success',
		data: {
			bid
		}
	});
});

exports.deleteBid = catchAsync(async (req, res, next) => {
	const biddingId = req.params.id;
	const bid = await Bidding.destroy({ where: { biddingId }});

	if (!bid) return next(new AppError('No record found with given Id', 404));

	res.status(204).json({
		status: 'success',
		data: {
			bid
		}
	});
});