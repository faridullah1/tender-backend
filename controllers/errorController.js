const sendErrorDev = (err, res) => {
	let errorMessage = err.message;

	if (err.name) {
		switch(err.name) {
			case 'SequelizeUniqueConstraintError':
				const field = Object.entries(err.fields);
				errorMessage = `${field[0][0]} already exists`;
				break;
		}
	}

	res.status(err.statusCode).json({
		status: err.status,
		message: errorMessage,
		err: err,
		stack: err.stack
	});
}

const sendErrorProd = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
}

module.exports = (err, req, res, next) => {	
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	}
	else if (process.env.NODE_ENV === 'production') {
		sendErrorProd(err, res);
	}
}