const express = require('express');
const router = express.Router();
const biddingController = require('../controllers/biddingController');
const { auth } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/permissions');

router.route('/')
	.get(auth, biddingController.getAllBids)
	.post(auth, restrictTo('Consultant', 'Constractor', 'Supplier'), biddingController.participateInBidding);

router.use(auth, restrictTo('Super_Admin', 'Admin'));
router.route('/:id')
	.delete(biddingController.deleteBid)

module.exports = router;