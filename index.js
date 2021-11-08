'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var serverPort = 8080;

//declaration of the server controllers
var LoginController = require(path.join(__dirname, 'controllers/Login')); 
var TasksController = require(path.join(__dirname, 'controllers/Tasks'));
var UsersController = require(path.join(__dirname, 'controllers/Users'));
var AssignedTasksController = require(path.join(__dirname, 'controllers/AssignedTasks'));

// swaggerRouter + express + passport configurations
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);

var app = expressAppConfig.getApp();

const { passport, opts, jwtstrategy } = require('./passport.js');  
app.use(passport.initialize());


//declaration of the used schema validations
var fs = require('fs');
var { Validator, ValidationError } = require('express-json-validator-middleware');
var taskSchema= JSON.parse(fs.readFileSync('./schemas/TaskSchema_v3.json'));
var validator = new Validator({ allErrors: true });
validator.ajv.addSchema(taskSchema);
var validate = validator.validate;

//middleware / error handler for validation errors [non funziona e da 500 per un qualche motivo]
app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(400).send('The submitted object does not correspond to the required schema. Try again.');
    next();
  }  
  else 
    next(err);
});


app.post('/api/login', LoginController.loginPOST);
//app.delete('/api/login', LoginController.loginDELETE);

app.get('/api/users/:userId', passport.authenticate('jwt', {session: false}), UsersController.usersIdGET);

app.get('/api/tasks',passport.authenticate('jwt', {session: false}), TasksController.tasksGET);
app.get('/api/tasks/public', TasksController.tasksPublicGET); //unica chiamata get publica
app.get('/api/tasks/assignedToMe',passport.authenticate('jwt', {session: false}), TasksController.tasksAssignedToMeGET);
app.get('/api/tasks/createdByMe',passport.authenticate('jwt', {session: false}), TasksController.tasksCreatedByMeGET);

app.post('/api/tasks', passport.authenticate('jwt', {session: false}), validate({ body: taskSchema }), TasksController.tasksPOST);
app.get('/api/tasks/:taskId', passport.authenticate('jwt', {session: false}), TasksController.tasksTaskIdGET);
app.put('/api/tasks/:taskId', passport.authenticate('jwt', {session: false}), validate({ body: taskSchema }), TasksController.tasksTaskIdPUT);
app.delete('/api/tasks/:taskId', passport.authenticate('jwt', {session: false}), TasksController.tasksTaskIdDELETE);
app.put('/api/tasks/:taskId/markTask', passport.authenticate('jwt', {session: false}), TasksController.tasksTaskIdMarkTaskPUT);

app.get('/api/tasks/:taskId/assignedTo', passport.authenticate('jwt', {session: false}), AssignedTasksController.tasksTaskIdAssignedToGET);
app.put('/api/tasks/:taskId/assignedTo/:userId', passport.authenticate('jwt', {session: false}), AssignedTasksController.tasksTaskIdAssignedToUserIdPUT);
app.delete('/api/tasks/:taskId/assignedTo/:userId', passport.authenticate('jwt', {session: false}), AssignedTasksController.tasksTaskIdAssignedToUserIdDELETE);


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

