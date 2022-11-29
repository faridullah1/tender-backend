const { Project, validate } = require('../models/projectsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
	const project = await Project.findOne({ where: { projectId }});

	if (!project) return next(new AppError('No record found with given Id', 404));

	res.status(200).json({
		status: 'success',
		data: {
			project
		}
	});
});

exports.createProject = catchAsync(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new AppError(error.message, 400));

	projectImages = [
		"https://toptender.qa/toptender/public/images/works/991628583206.jpg", 
		"https://toptender.qa/toptender/public/images/works/211628583166.jpg",
		"https://toptender.qa/toptender/public/images/works/541628582653.jpg",
		"https://toptender.qa/toptender/public/images/works/791628583231.jpg"
	];

	const { name, location, image } = req.body;

	const project = await Project.create({ name, location, image: projectImages[Math.floor(Math.random() * projectImages.length)]});
	
	res.status(201).json({
		status: 'success',
		data: {
			project
		}
	});
});