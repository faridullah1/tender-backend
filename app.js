const express = require('express');
const dotEnv = require('dotenv');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

dotEnv.config({
	path: './config.env'
});

app.use(express.json());

// Routers
const userRouter = require('./routes/userRoutes');

app.get('/', (req, res) => {
	res.status(200).send('Welcome to Wissal Tender Application')
});

// API endPoints
app.use('/api/users', userRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const sequelize = require('./db');
sequelize.sync().then(() => 
{
	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Server is listening on port ${port}`);
		console.log(`Connected to database ${process.env.DATABASE}`);
	});
})
