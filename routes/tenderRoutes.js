const express = require('express');
const router = express.Router();
const tenderControler = require('../controllers/tenderController');
const { auth } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/permissions');

router.route('/')
	.get(tenderControler.getAllTenders)
	.post(auth, restrictTo('Super_Admin', 'Admin'), tenderControler.createTender);

// router.route('/:id')
// 	.get(tenderControler.getProject)
// 	.patch(tenderControler.updateProject)
// 	.delete(tenderControler.deleteProject)

module.exports = router;