const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.route('/otpVerification').post(userController.mobileOTPVerification);

router.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);

module.exports = router;