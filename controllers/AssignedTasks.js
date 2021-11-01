'use strict';

var utils = require('../utils/writer.js');
var AssignedTasks = require('../service/AssignedTasksService');
var Tasks = require('../service/TasksService');

module.exports.tasksTaskIdAssignedToGET = function tasksTaskIdAssignedToGET (req, res, next) {
  AssignedTasks.tasksTaskIdAssignedToGET(req.params.taskId)
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
  //verifica che il richiedente è anche owner dello specifico task
  //verifica che l'utente specificato esista sul serio (altrimenti ritorna 404 not found)
  //SELECT from users where id = userId
  //rimuovi quindi con una seconda query l'assegnazione delll'utente richiesto dal task
  //DELETE from assignments where taskId = task = and user = userId
module.exports.tasksTaskIdAssignedToUserIdDELETE = async function tasksTaskIdAssignedToUserIdDELETE (req, res, next) {
  try {
    const checkOwner = await Tasks.checkTaskOwner(req.params.taskId, 1); //req.user.id 
    if(checkOwner) {
      const checkUser = await AssignedTasks.checkIfUserExists(req.params.userId);;
      if(checkUser) {
        await AssignedTasks.tasksTaskIdAssignedToUserIdDELETE(req.params.taskId, req.params.userId);
        res.status(201).end();
      }
      else {
        throw new Error('404');
      }
    }
    else { 
      throw new Error('400');
    }
  } catch(err) {
    if(err.message === '400')
      res.status(400).json({ error: "can't update because the user is not the task's owner"});
    else if(err.message === '404')
      res.status(404).json({ error: "can't update because the inserted user id does not exist"});
    else if(err === "taskId not found")
      res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
    else
      res.status(503).json({ error: err}); //riporta l'errore sql generico
  }


  /*Tasks.checkTaskOwner(req.params.taskId, 4) //req.user.id 
    .then(function (response) {
      if(response)
        AssignedTasks.checkIfUserExists(1); //req.user.id
      else
        res.status(400).json({ error: "can't update because the user is not the task's owner"}); 
    })
    .then(function (response) {
      if(response)
        AssignedTasks.tasksTaskIdAssignedToUserIdDELETE(req.params.taskId, 1); //req.user.id
      else
        res.status(404).json({ error: "can't update because the inserted user id does not exists"}); 
    })
    .then(response => res.status(204).end())
    .catch(function (response) {
      if(response === "taskId not found")
        res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });*/
};

  //verifica che il richiedente è anche owner dello specifico task
  //chiama la funzione già presente, senza l'uso del join con assignments

  //verifica che l'utente specificato esista sul serio (altrimenti ritorna 404 not found)

  //forse te sei inutilmente complessa ed anche controproducente per l'update
  //select t.owner from tasks t, assignments a where a.task = t.id and t.id = 4
  //restituisci la prima riga (possono essere più di una essendo un join)

  //inserisci quindi con una seconda query l'assegnazione dell'utente richiesto al task specificato
  //DELETE from assignments where = task = and user = 
module.exports.tasksTaskIdAssignedToUserIdPUT = async function tasksTaskIdAssignedToUserIdPUT (req, res, next) {
  try {
    const checkOwner = await Tasks.checkTaskOwner(req.params.taskId, 1); //req.user.id 
    if(checkOwner) {
      const checkUser = await AssignedTasks.checkIfUserExists(req.params.userId);;
      if(checkUser) {
        await AssignedTasks.tasksTaskIdAssignedToUserIdPUT(req.params.taskId, req.params.userId);
        res.status(201).end();
      }
      else {
        throw new Error('404');
      }
    }
    else { 
      throw new Error('400');
    }
  } catch(err) {
    if(err.message === '400')
      res.status(400).json({ error: "can't update because the user is not the task's owner"});
    else if(err.message === '404')
      res.status(404).json({ error: "can't update because the inserted user id does not exist"});
    else if(err === "taskId not found")
      res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
    else
      res.status(503).json({ error: err}); //riporta l'errore sql generico
  }



/*
  Tasks.checkTaskOwner(req.params.taskId, 1) //req.user.id 
    .then(function (response) {
      if(response)
        AssignedTasks.checkIfUserExists(req.params.userId);
      else
        res.status(400).json({ error: "can't update because the user is not the task's owner"}); 
    })
    .then(function (response) {
      if(response)
        AssignedTasks.tasksTaskIdAssignedToUserIdPUT(req.params.taskId, req.params.userId);
      else
        res.status(404).json({ error: "can't update because the inserted user id does not exists"}); 
    })
    .then(response => res.status(204).end())
    .catch(function (response) {
      if(response === "taskId not found")
        res.status(404).json({ error: "can't update because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response}); //riporta l'errore sql generico
    });*/
};
