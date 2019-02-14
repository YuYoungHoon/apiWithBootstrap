const router = require('express').Router();
const controller = require('./controller');
const authMiddleware = require('../../../middlewares/auth');

router.post('/register', controller.register);
router.post('/token', controller.login);
router.get('/check', controller.check);
router.use('/check', authMiddleware);


module.exports = router;
