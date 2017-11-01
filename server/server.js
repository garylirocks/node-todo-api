require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    let todo = new Todo({
        title: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc)
    }, (e) => {
        res.status(400).send(e)
    })
});


// GET HTTP request is called on /todos path
app.get('/todos', (req, res) => {

  // Calls find function on Todo
  Todo.find().then((todos) => {

    // Responds with all todos, as an object
    res.send({todos})

    // In case of an error
  }, (e) => {

    // Responds with status code of 400
    res.status(400).send(e)
  })
})

// GET HTTP request is called to retrieve individual todos
app.get('/todos/:id', (req, res) => {

  // Obtain the id of the todo which is stored in the req.params.id
  let id = req.params.id

  // Validates id
  if (!ObjectId.isValid(id)) {

    // Returns 400 error and error message when id is not valid
    return res.status(404).send('ID is not valid')
  }

  // Query db using findById by passing in the id retrieve
  Todo.findById(id).then((todo) => {

    // If no todo is found with that id, an error is sent
    if (!todo) {
      return res.status(404).send()
    }

    // Else the todo retrieve from the DB is sent.
    res.send({todo})

    // Error handler to catch and send error
  }).catch((e) => {
    res.status(400).send()
  })
})

// HTTP DELETE request routed to /todos/:id
app.delete('/todos/:id', (req, res) => {

  // Obtain the id of the todo which is stored in the req.params.id
  let id = req.params.id

  // Validates id
  if (!ObjectId.isValid(id)) {

    // Returns 400 error and error message when id is not valid
    return res.status(404).send()
  }

  // Finds todo with the retrieved id, and removes it
  Todo.findByIdAndRemove(id).then((todo) => {

    // If no todo is found with that id, an error is sent
    if (!todo) {
      return res.status(404).send()
    }

    // Responds with todo
    res.send({todo})

    // Error handler to catch and send error
  }).catch((e) => {
    res.status(400).send()
  })
})

// HTTP PATCH requested routed to /todos/:id
app.patch('/todos/:id', (req, res) => {

  // Obtain the id of the todo which is stored in the req.params.id
  let id = req.params.id

  //  Creates an object called body of the picked values (text and completed), from the response gotten
  let body = _.pick(req.body, ['text', 'completed'])

    // Validates id
    if (!ObjectId.isValid(id)) {
      // Returns 400 error and error message when id is not valid
      return res.status(404).send()
  }

  // Checks if body.completed is boolean, and if it is set
  if (_.isBoolean(body.completed) && body.completed) {

    // Sets body.completedAt to the current time
    body.completedAt = new Date().getTime()
  } else {

    // Else body.completed is set to false and body.completedAt is null
    body.completed = false
    body.completedAt = null
  }

  // Finds a todo with id that matches the retrieved id.
  // Sets the body of the retrieved id to a new one
  Todo.findOneAndUpdate(id, {$set: body}, {new: true}).then((todo) => {

    // If no todo is found with that id, an error is sent
    if (!todo) {
      return res.status(404).send()
    }

    // Responds with todo
    res.send({todo})

    // Error handler to catch and send error
  }).catch((e) => {
    res.status(400).send()
  })

})

// Listens for connection on the given port
app.listen(port, () => {
  console.log(`Starting on port ${port}`)
})

// Exports the module as app.
module.exports = {app}
