const User = require('../../../models/user')
const crypto = require('crypto');
const config = require('../../../config');
/*
    GET /api/user/list
*/
exports.list = (req, res) => {
  // refuse if not an admin
  if (!req.decoded.admin) {
    return res.status(403).json({
      message: 'you are not an admin'
    })
  }
  User.find({})
    .then(
      users => {
        res.json({
          users
        })
      }
    )
}
/*
    POST /api/user/assign-admin/:username
*/
exports.assignAdmin = (req, res) => {
  // refuse if not an admin
  if (!req.decoded.admin) {
    return res.status(403).json({
      message: 'you are not an admin'
    })
  }
  User.findOneByloginId(req.params.loginId)
    .then(
      user => user.assignAdmin
    ).then(
      res.json({
        success: true
      })
    )
}
/*
    GET /api/user/userInfo
*/
exports.userInfo = (req, res) => {
  User.find({
      "loginId": req.decoded.loginId
    })
    .then(
      users => {
        res.json({
          users
        })
      }
    )
}
/*
    Delete /api/user/remove
    {"loginId":loginId}
*/
exports.remove = (req, res) => {
  const loginId = req.body.loginId
  console.log(loginId);
  //return User.removeByloginId(loginId);
  if (!req.decoded.admin) {
    return res.status(403).json({
      message: 'you are not an admin'
    })
  }
  User.deleteOne({
    "loginId": loginId
  }).exec();
  res.json({
    success: true
  })
}
/*
  Delete /api/user/chgPassword
  {"loginId":loginId,"password":password}
*/
exports.password = (req, res) => {
  const loginId = req.body.loginId
  const password = req.body.password
  var encrypted;
  if (password) {
    encrypted = crypto.createHmac('sha1', config.secret)
      .update(password)
      .digest('base64');
    //password = encrypted
  }
  console.log("encrypted: " + encrypted);
  User.update({
    loginId: loginId
  }, {
    $set: {
      password: encrypted
    }
  }).exec()
  res.json({
    success: true
  })
}
/*
*/
exports.initPassword = (req, res) => {
  console.log(req.body.loginId);
  const loginId = req.body.loginId
    var password = crypto.createHmac('sha1', config.secret)
      .update("password")
      .digest('base64');
    //password = encrypted
  User.update({
    loginId: loginId
  }, {
    $set: {
      password: password
    }
  }).exec()
  res.json({
    success: true
  })
}
/*
  PUT /api/user/chgUserInfo
  {loginId:(userName),(admin)}
*/
exports.chgUserInfoByAdmin = (req, res) => {
  const loginId = req.body.loginId;
  const userName = req.body.userName;
  const adminYn = req.body.admin;
  if (!req.decoded.admin) {
    return res.staus(403).json({
      message: 'you are not an admin'
    })
  }
  User.update({
    loginId: loginId
  }, {
    $set: {
      userName: userName,
      admin: adminYn
    }
  }).exec()
  res.json({
    success: true
  })
}
