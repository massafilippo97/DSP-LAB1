'use strict';

var utils = require('../utils/writer.js');
var Login = require('../service/LoginService');

///const passportObjects = require('./passport'); //vedo se serve almeno per inizializzarlo
const { passport, opts, jwtstrategy } = require('../passport.js');
const jsonwebtoken = require('jsonwebtoken');

module.exports.loginDELETE = function loginDELETE (req, res, next) {
  Login.loginDELETE()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.loginPOST = function loginPOST (req, res, next) {
  /*Login.loginPOST()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });*/
    //https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314

    passport.authenticate('local', {session: false}, (err, user, info) => { //evoca l'authN locale definita in index.js e al suo termine passa alla callback (successiva)
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user   : user,
          info: info
        });
      }
      req.login(user, {session: false}, (err) => {
        if (err) {
            res.send(err);
        }
        // generate a signed son web token with the contents of user object and return it in the response
        //const token = jwt.sign(user, 'your_jwt_secret');
        //return res.json({user, token});
      
        const token = jsonwebtoken.sign({ user: user.id }, opts.secretOrKey );
        res.cookie('jwt', token, { httpOnly: true, sameSite: true});
        return res.json({ id: user.id, name: user.name});
      });
  })(req, res);
};

