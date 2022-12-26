const express = require('express');
const router = express.Router();
const tenderControler = require('../controllers/tenderController');
const { auth } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/permissions');

router.route('/')
	.get(auth, tenderControler.getAllTenders)
	.post(auth, restrictTo('Super_Admin', 'Admin'), tenderControler.createTender);

router.use(auth, restrictTo('Super_Admin', 'Admin'));

router.route('/:id')
	.get(tenderControler.getTender)
	.patch(tenderControler.updateTender)
	.delete(tenderControler.deleteTender)

module.exports = router;