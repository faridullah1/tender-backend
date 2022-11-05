const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.status(200).send('Welcome to tender application')
});

app.get('/api/login', (req, res) => {
	res.status(200).send('Login working');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});