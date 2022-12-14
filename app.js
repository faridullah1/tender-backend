const express = require('express');
const compression = require('compression');
const dotEnv = require('dotenv');
const cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

dotEnv.config({
	path: './config.env'
});

app.use(express.json());
app.use(compression());
app.use(cors());

// Routers
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const projectRouter = require('./routes/projectRoutes');
const tenderRouter = require('./routes/tenderRoutes');
const bidsRouter = require('./routes/biddingRoutes');
const notificationRouter = require('./routes/notificationRoutes');


app.get('/', (req, res) => {
	res.status(200).send('Welcome to Wissal Tender Application');
});

// API endPoints
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tenders', tenderRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/notifications', notificationRouter);


// Handling unhandled routes
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const sequelize = require('./db');

// Run the migration to populate database with the tables
require('./migration.js')();

sequelize.sync().then(() => 
{
	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Server is listening on port ${port}`);
		console.log(`Connected to database ${process.env.DATABASE}`);
	});
})
