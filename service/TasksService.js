'use strict';

// open the database 
const db = require('../db.js');

/**
 * Retrieve all the tasks
 *
 * filter List Specifies the filter value necessary to filter the list of tasks (optional)
 * returns List
 **/
exports.tasksGET = function(filter, user_id) {
  return new Promise(function(resolve, reject) {
  /*  var examples = {};
    examples['application/json'] = [ {
  "important" : false,
  "owner" : "http://example.com/aeiou",
  "private" : true,
  "projects" : "",
  "description" : "description",
  "id" : "id",
  "completed" : false,
  "deadline" : "2000-01-23T04:56:07.000+00:00",
  "assignedTo" : "http://example.com/aeiou"
}, {
  "important" : false,
  "owner" : "http://example.com/aeiou",
  "private" : true,
  "projects" : "",
  "description" : "description",
  "id" : "id",
  "completed" : false,
  "deadline" : "2000-01-23T04:56:07.000+00:00",
  "assignedTo" : "http://example.com/aeiou"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }*/


    let sql_query = ""; 
    //https://sqlite.org/lang_datefunc.html
    switch(filter){ //if authenticated (cioè se user_id è != null)
      case 'public':
        sql_query = "SELECT t.id, t.description, t.important, t.private, t.project, t.deadline, t.completed, t.owner FROM assignments a, tasks t WHERE t.id = a.task AND user = 1 AND private = 0 UNION SELECT * FROM tasks WHERE owner = "+user_id+" and private = 0;";
        break;
      case 'assignedToMe':
        sql_query = "SELECT t.id, t.description, t.important, t.private, t.project, t.deadline, t.completed, t.owner FROM assignments a, tasks t WHERE t.id = a.task AND user = "+user_id+";"
        break;
      case 'createdByMe':
        sql_query = "SELECT * FROM tasks WHERE user = "+user_id+";";   
        break;
      default:  //qualsiasi altro caso ritorna sempre la lista non filtrata (anche ?filter=all)
        sql_query = "SELECT t.id, t.description, t.important, t.private, t.project, t.deadline, t.completed, t.owner FROM assignments a, tasks t WHERE t.id = a.task AND user = "+user_id+" UNION SELECT * from tasks WHERE owner = "+user_id+";"
        break; 
    }

//if not authenticated, then perform the basic query "SELECT * FROM tasks WHERE private=0";

    db.all(sql_query, [], (err, rows) =>{ 
      if(err) {
        reject(err);
        return;
      }
      resolve(rows.map((row) => ({ id: row.id, description: row.description, important: row.important, private: row.private, project: row.project, deadline: row.deadline, completed: row.completed, owner: row.owner})));
    });
  });
};

/**
 * Add a new task (ID is automatically generated by the server and the creator becomes its owner [assignees list is left empty])
 *
 * body List It is required a single Task object (optional)
 * no response value expected for this operation
 **/
exports.tasksPOST = function(body, user_id, max_id) { //body == new task
  return new Promise(function(resolve, reject) {
    const sql_query = "INSERT INTO tasks(id,description,important,private,project,deadline,completed,owner) VALUES (?,?,?,?,?,?,?,?)";
    db.run(sql_query, [max_id, body.description, body.important, body.private, body.project, body.deadline, body.completed, user_id], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

//search the max possible id from all registered tasks (useful when automatically assigning a new taskID)
exports.searchMaxID = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "SELECT max(id) AS max_id FROM tasks;";
    db.all(sql_query, [], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].max_id);
    });
  });
}

/**
 * Delete an existing task by ID (if the requester is the owner)
 *
 * taskId Long Task id to delete
 * no response value expected for this operation
 **/
exports.tasksTaskIdDELETE = function(taskId) {
  return new Promise((resolve, reject)=> {
    const sql_query = 'DELETE FROM tasks WHERE id=?';
    db.run(sql_query, [taskId], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

//executed before the delete to check if the requester is the owner of the task
exports.checkTaskOwner = function(taskId, userId) {
  return new Promise((resolve, reject) => {
    const sql_query = 'SELECT owner FROM tasks WHERE id=?';
    db.all(sql_query, [taskId], (err, rows) => {
      if(err) {
        reject(err);
        return;
      }
      if(rows.length === 0) {
        reject("taskId not found");
        return;
      }
      resolve(rows[0].owner === userId) 
      //resolve(rows[0].owner);
    })
  })
}


/**
 * Retrieve the specific tasks by its ID
 *
 * taskId Long Task id to delete
 * returns List
 **/
exports.tasksTaskIdGET = function(taskId) {
  return new Promise(function(resolve, reject) {
    const sql_query = "SELECT * FROM tasks WHERE id=?"
    db.all(sql_query, [taskId], (err, rows) =>{
      if(err){
        reject(err);
        return;
      }
      if(rows.length === 0) {
        reject("taskId not found");
        return;
      }
      resolve(rows.map((row) => ({ id: row.id, description: row.description, important: row.important, private: row.private, project: row.project, deadline: row.deadline, completed: row.completed, owner: row.owner})));
    });
  });
};

/**
 * Change the specified Task's status as completed (or not?)
 *
 * taskId Long Task id
 * no response value expected for this operation
 **/
exports.tasksTaskIdMarkTaskPUT = function(taskId, completed) {
  return new Promise((resolve, reject) => {
    const sql_query =  "UPDATE tasks SET completed=? WHERE id=?";  
    db.run(sql_query, [!JSON.parse(completed),taskId], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}

//fetch the current value for the completed attribute of the specific task (useful when marking the task as completed or uncompleted)
exports.checkCompleteValue = (taskId) => {
  return new Promise((resolve, reject) => {
    const sql_query = "SELECT completed FROM tasks WHERE id = ?;";
    db.all(sql_query, [taskId], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].completed);
    });
  });
}



/**
 * Update an existing task, identified by the specified ID (if the requester is the owner) [completed property cannot be changed here]
 *
 * body List It is required a single Task object (optional)
 * taskId Long Task id to update
 * no response value expected for this operation
 **/
exports.tasksTaskIdPUT = function(body,taskId) {
  return new Promise((resolve, reject) => {
    const sql_query = "UPDATE tasks SET description=?,important=?,private=?,project=?,deadline=?,completed=?, owner=? WHERE id=?";
    db.run(sql_query, [body.description, body.important,body.private,body.project, body.deadline,body.completed, body.owner, taskId], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
}
