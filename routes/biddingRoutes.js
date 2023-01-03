const express = require('express');
const router = express.Router();
const biddingController = require('../controllers/biddingController');
const { auth } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/permissions');

router.route('/')
	.get(auth, restrictTo('Super_Admin', 'Admin'), biddingController.getAllBids)
	.post(auth, restrictTo('Consultant', 'Constractor', 'Supplier'), biddingController.participateInBidding);

router.route('/:id')
	.patch(auth, restrictTo('Consultant', 'Constractor', 'Supplier', 'Super_Admin', 'Admin'), biddingController.updateBid)
	.delete(auth, restrictTo('Super_Admin', 'Admin'), biddingController.deleteBid)

module.exports = router;