const router = require('express').Router()
const controller = require('./controller');

router.get('/list', controller.list);
router.post('/assign-admin/:loginId', controller.assignAdmin);
router.delete('/remove', controller.remove);
router.put('/chgPasword', controller.password);
router.put('/initPassword', controller.initPassword);
router.get('/userInfo', controller.userInfo);
router.put('/chgUserInfoByAdmin', controller.chgUserInfoByAdmin);


module.exports = router;
