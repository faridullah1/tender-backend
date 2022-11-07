const superAgent = require('superagent');


exports.generateRandomFourDigits = () => {
	return Math.floor(1000 + Math.random() * 9000);
}

exports.sendSMS = async (number, text) => {
	const payload = JSON.stringify({
		to: number,
		body: text
	});

	return await superAgent.post(process.env.BULK_SMS_API_BASE_URL + 'messages')
				.send(payload)
				.set('Content-Type', 'application/json')
				.set('Authorization', `Basic ${process.env.BULK_SMS_TOKEN_ID}`);
}