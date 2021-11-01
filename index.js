'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var serverPort = 8080;

//declaration of the server controllers
var LoginController = require(path.join(__dirname, 'controllers/Login')); 
var TasksController = require(path.join(__dirname, 'controllers/Tasks'));
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

/*
//utile per autenticare richieste
//passport.authenticate('jwt', {session: false})
//esempio di uso
app.use('/auth', auth);
app.use('/user', passport.authenticate('jwt', {session: false}), user);

//dovrei piazzarla dove??
passport.use(new jwtstrategy(opts, function(jwt_payload, done){
    return done(null, jwt_payload.user);
  })
);
*/

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


app.post('/login', LoginController.loginPOST);
app.delete('/login', LoginController.loginDELETE);

app.get('/tasks', TasksController.tasksGET);
app.post('/tasks', validate({ body: taskSchema }), TasksController.tasksPOST);
app.get('/tasks/:taskId', TasksController.tasksTaskIdGET);
app.put('/tasks/:taskId', validate({ body: taskSchema }), TasksController.tasksTaskIdPUT);
app.delete('/tasks/:taskId', TasksController.tasksTaskIdDELETE);
app.put('/tasks/:taskId/markTask', TasksController.tasksTaskIdMarkTaskPUT);

app.get('/tasks/:taskId/assignedTo', AssignedTasksController.tasksTaskIdAssignedToGET);
app.put('/tasks/:taskId/assignedTo/:userId', AssignedTasksController.tasksTaskIdAssignedToUserIdPUT);
app.delete('/tasks/:taskId/assignedTo/:userId', AssignedTasksController.tasksTaskIdAssignedToUserIdDELETE);


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

