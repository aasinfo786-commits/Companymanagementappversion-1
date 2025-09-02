const express = require('express');
const router = express.Router();
const finishedGoodsController = require('../controllers/finishedGoodsController');

// Default finished goods routes
router.get('/defaults/finishedGoods/:companyId', finishedGoodsController.getDefaultFinishedGoods);
router.post('/defaults/finishedGoods', finishedGoodsController.addDefaultFinishedGood);
router.put('/defaults/finishedGoods/:id', finishedGoodsController.updateDefaultFinishedGood);
router.delete('/defaults/finishedGoods/:id', finishedGoodsController.deleteDefaultFinishedGood);
router.patch('/defaults/finishedGoods/:id/active', finishedGoodsController.toggleActive);
router.patch('/defaults/finishedGoods/:id/default', finishedGoodsController.toggleDefault);

module.exports = router;