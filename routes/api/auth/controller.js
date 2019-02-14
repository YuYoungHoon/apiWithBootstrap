const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
/*
    POST /api/auth/register
    {loginId,userName,password}
*/
exports.register = (req, res) => {
  const {
    loginId,
    userName,
    password
  } = req.body
  let newUser = null
  // create a new user if does not exist
  const create = (user) => {
    if (user) {
      throw new Error('loginId exists');
    } else {
      return User.create(loginId, userName, password);
    }
  }
  // count the number of the user
  const count = (user) => {
    newUser = user;
    return User.count({}).exec();
  }
  // assign admin if count is 1
  const assign = (count) => {
    if (count === 1) {
      return newUser.assignAdmin();
    } else {
      // if not, return a promise that returns false
      return Promise.resolve(false);
    }
  }
  // respond to the client
  const respond = (isAdmin) => {
    res.json({
      message: 'registered successfully',
      admin: isAdmin ? true : false
    });
  }
  // run when there is an error (loginId exists)
  const onError = (error) => {
    res.status(409).json({
      message: error.message
    });
  }
  // check loginId duplication
  User.findOneByloginId(loginId)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
    .catch(onError);
}

/*
    POST /api/auth/token
    {
        loginId,
        password
    }
*/
exports.login = (req, res) => {
  const {
    loginId,
    password
  } = req.body
  const secret = req.app.get('jwt-secret'); //app.js setted
  // check the user info & generate the jwt
  const check = (user) => {
    if (!user) {
      // user does not exist
      throw new Error('login failed');
    } else {
      // user exists, check the password
      if (user.verify(password)) {
        // create a promise that generates jwt asynchronously
        const p = new Promise((resolve, reject) => {
          jwt.sign({
              _id: user._id,
              loginId: user.loginId,
              usernName: user.usernName,
              admin: user.admin
            },
            secret, {
              expiresIn: '1d',
              issuer: 'ATEC_AP',
              subject: 'userInfo'
            }, (err, token) => {
              if (err) reject(err)
              resolve(token)
            });
        });
        return p
      } else {
        throw new Error('login failed');
      }
    }
  }
  // respond the token
  const respond = (token) => {
    res.json({
      message: 'Maked Token successfully',
      token: token
    });
  }
  // error occured
  const onError = (error) => {
    res.status(403).json({
      message: error.message
    });
  }
  // find the user
  User.findOneByloginId(loginId)
    .then(check)
    .then(respond)
    .catch(onError);
}
/*
    GET /api/auth/check
*/
exports.check = (req, res) => {
  res.json({
    success: true,
    info: req.decoded
  })
}
