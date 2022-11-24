const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.route('/otpVerification').post(userController.mobileOTPVerification);
router.route('/sendEmail').post(userController.sendEmail);
router.route('/createSuperAdmin').post(userController.createSuperAdmin);

router.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);

router.route('/verify/:confirmationCode').get(userController.verifyUser);

module.exports = router;