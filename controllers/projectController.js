const { Project, validate } = require('../models/projectsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Constants } = require('../utils/contants');

exports.getAllProjects = async (req, res, next) => {
	const projects = await Project.findAll();

	res.status(200).json({
		status: 'success',
		data: {
			projects
		}
	});
};

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
	if (userType !== 'Client') return next(new AppError("You don't have the permission to create project."), 403);

	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	projectImages = [
		"https://toptender.qa/toptender/public/images/works/991628583206.jpg", 
		"https://toptender.qa/toptender/public/images/works/211628583166.jpg",
		"https://toptender.qa/toptender/public/images/works/541628582653.jpg",
		"https://toptender.qa/toptender/public/images/works/791628583231.jpg"
	];

	const { name, location, description, type, image } = req.body;

	const project = await Project.create({ 
		name, 
		location, 
		image: projectImages[Math.floor(Math.random() * projectImages.length)],
		description,
		type
	});
	
	res.status(201).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.approveProject = catchAsync(async (req, res, next) => {
	const { type: userType } = req.user;
	const adminUsers = Constants.ADMIN_USER_Types;

	if (!adminUsers.includes(userType)) return next(new AppError("You don't have the permission to approve project."), 403);

	const projectId = req.params.id;
	const project = await Project.findByPk(projectId);

	if (!project) return next(new AppError('No record found with given Id', 404));

	project.isApproved = true;

	res.status(200).json({
		status: 'success',
		data: {
			project
		}
	});
});