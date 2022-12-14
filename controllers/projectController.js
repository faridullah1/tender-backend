// 3rd party packages
const { Op } = require('sequelize');

// Models
const { Project, validate } = require('../models/projectsModel');
const { Tender } = require('../models/tenderModel');
const { User } = require('../models/userModel');

// Utils
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllProjects = catchAsync(async (req, res, next) => {
	const { type, userId } = req.user;
	const name = req.query.name;
	const isApproved = req.query.isApproved;

	const where = {};

	// Fetch projects containing name
	if (name) {
		where.name = {
			[Op.like]: '%' + name + '%'
		}
	}
	else if (isApproved) {
		where.isApproved = (isApproved === 'true');
	}

	// Project is always associated with a client, no project without a client;
	if (type === 'Client') {		
		where.clientId = userId;
	}

	const projects = await Project.findAll( { where, include: [
		{ 
			model: User, attributes: ['name', 'mobileNumber'] 
		},
		{
			model: Tender, attributes: ['tenderNumber']
		}
	] });

	res.status(200).json({
		status: 'success',
		data: {
			projects
		}
	});
});

exports.getProject = catchAsync(async (req, res, next) => {
	const projectId = req.params.id;
	const project = await Project.findByPk(projectId);

	if (!project) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.createProject = catchAsync(async (req, res, next) => {
	const { type: userType } = req.user;

	if (!['Client', 'Super_Admin'].includes(userType)) {
		return next(new AppError("You don't have the permission to create project.", 403));
	}

	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	projectImages = [
		"https://toptender.qa/toptender/public/images/works/991628583206.jpg", 
		"https://toptender.qa/toptender/public/images/works/211628583166.jpg",
		"https://toptender.qa/toptender/public/images/works/541628582653.jpg",
		"https://toptender.qa/toptender/public/images/works/791628583231.jpg"
	];

	const { name, location, description, type, image, clientId } = req.body;

	const project = await Project.create({ 
		name, 
		location, 
		image: projectImages[Math.floor(Math.random() * projectImages.length)],
		description,
		type,
		clientId
	});

	if (userType === 'Super_Admin') {
		project.isApproved = true;
		await project.save();
	}
	
	res.status(201).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.updateProject = catchAsync(async (req, res, next) => {
	const projectId = req.params.id;
	const project = await Project.update(req.body, { where: { projectId }});

	if (!project) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.deleteProject = catchAsync(async (req, res, next) => {
	const projectId = req.params.id;
	const project = await Project.destroy({ where: { projectId }});

	if (!project) return next(new AppError('No record found with given Id', 404));

	res.status(204).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.approveProject = catchAsync(async (req, res, next) => {
	const { type: userType } = req.user;

	const adminUsers = ['Super_Admin', 'Admin', 'Employee'];
	if (!adminUsers.includes(userType)) return next(new AppError("You don't have the permission to approve project."), 403);

	const projectId = req.params.id;
	const project = await Project.findByPk(projectId);

	if (!project) return next(new AppError('No record found with given Id', 404));

	project.isApproved = true;
	await project.save();

	res.status(200).json({
		status: 'success',
		data: {
			project
		}
	});
});