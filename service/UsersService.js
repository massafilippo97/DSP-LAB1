'use strict';

const db = require('../db.js');

/**
 * Retrieve the list of all the assignes of that task
 *
 * taskId Long Task id to delete
 * returns List
 **/
exports.usersIdGET = function(userId) {
  return new Promise(function(resolve, reject) {
    var sql_query = "select u.id, u.email, u.name from users u where u.id = ?";

    db.all(sql_query, [userId], (err, rows) =>{ 
      if(err) {
        reject(err);
        return;
      }
      if(rows.length === 0) {
        reject("userId not found");
        return;
      }
      resolve(rows.map((row) => ({ 
        id: row.id, 
        email: row.email, 
        name: row.name, //dovrei rendere accessibili le risorse utente?
        _links: {
          self: {href: "http://localhost:8080/users/"+row.id},
          tasks: {href: "http://localhost:8080/tasks"},
          task: {href: "http://localhost:8080/tasks/{taskId}"},
          assignedTo: {href: "http://localhost:8080/tasks/{taskId}/assignedTo"},
          markTask: {href: "http://localhost:8080/tasks/{taskId}/markTask"},
          login: {href: "http://localhost:8080/login"}
        }
      })));
    });
  }); 
}