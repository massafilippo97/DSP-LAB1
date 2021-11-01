'use strict';

var utils = require('../utils/writer.js');
var Users = require('../service/UsersService');
//var Tasks = require('../service/TasksService');

module.exports.usersIdGET = function usersIdGET (req, res, next) {
    Users.usersIdGET(req.params.userId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if(response === "userId not found")
        res.status(404).json({ error: "user not found"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });
};