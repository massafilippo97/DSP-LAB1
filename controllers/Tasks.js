'use strict';

var utils = require('../utils/writer.js');
var Tasks = require('../service/TasksService');

module.exports.tasksGET = function tasksGET (req, res, next) {
  Tasks.tasksGET(req.query.filter, 1, req.query.page, req.query.size) //req.user.id
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      res.status(503).json({ error: response});
    });
};

module.exports.tasksPOST = function tasksPOST (req, res, next) {
  Tasks.searchMaxID()
    .then(function (max_id) {
      Tasks.tasksPOST(req.body, 1, max_id+1) //req.user.id
    })
    .then(function (response) {
      res.status(201).json(response).end(); //response == oggetto appena creato
    })
    .catch(function (response) {
      res.status(503).json({ error: response});
    });
};

module.exports.tasksTaskIdDELETE = function tasksTaskIdDELETE (req, res, next) {
  Tasks.checkTaskOwner(req.params.taskId, 3) //req.user.id 
    .then(function (response) {
      if(response)
        Tasks.tasksTaskIdDELETE(req.params.taskId);
      else
        res.status(400).json({ error: "can't delete because the user is not the task's owner"});
      //aggiungere qui un altro if per 404 task id not found
    })
    .then(response => res.status(204).end())
    .catch(function (response) {
      if(response === "taskId not found")
        res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });
};

module.exports.tasksTaskIdGET = function tasksTaskIdGET (req, res, next) {
  Tasks.tasksTaskIdGET(req.params.taskId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      if(response === "taskId not found")
        res.status(404).json({ error: "task not found"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });
};

module.exports.tasksTaskIdMarkTaskPUT = async function tasksTaskIdMarkTaskPUT (req, res, next) {
  try {
    const checkOwner = await Tasks.checkTaskOwner(req.params.taskId, 1);
    if(checkOwner) {
      const completedValue = await Tasks.checkCompleteValue(req.params.taskId);
      await Tasks.tasksTaskIdMarkTaskPUT(req.params.taskId, completedValue);
      res.status(201).end();
    }
    else { 
      throw new Error('400');
    }
  } catch(err) {
    if(err.message === '400')
      res.status(400).json({ error: "can't update because the user is not the task's owner"});
    else if(err === "taskId not found")
      res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
    else
      res.status(503).json({ error: response});
  }

  /*
  Tasks.checkTaskOwner(req.params.taskId, 1) //req.user.id  
    .then(function (response) {
      if(response)
        Tasks.checkCompleteValue(req.params.taskId)
      else { 
        throw new Error('400');
      }
      //aggiungere qui un altro if per 404 task id not found
    })  
    .then(function (response) {
      Tasks.tasksTaskIdMarkTaskPUT(req.params.taskId, response)
    })
    .then(function (response) {
      res.status(201).end();
    })
    .catch(function (response) {
      if(response.message === '400')
        res.status(400).json({ error: "can't update because the user is not the task's owner"});
      else
        utils.writeJson(res, response);
    });*/
};

module.exports.tasksTaskIdPUT = function tasksTaskIdPUT (req, res, next) {
  Tasks.checkTaskOwner(req.params.taskId, 1) //req.user.id  
    .then(function (response) {
      if(response)
        Tasks.tasksTaskIdPUT(req.body, req.params.taskId);
      else
        res.status(400).json({ error: "can't update because the user is not the task's owner"});
      //aggiungere qui un altro if per 404 task id not found
    })
    .then(response => res.status(204).end())
    .catch(function (response) {
      if(response === "taskId not found")
        res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });
};
