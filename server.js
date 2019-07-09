//Author - CJ Sloat cjsloat97@gmail.com

const express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');

const app = express();

app.use(express.static('./dist/autograde'));

const TWO_HOURS = 1000*60*60*2
/* 
Hi - I have no idea what webdev is

This is the node JS backend - to run in dev mode run "node run yeet"
  this runs the "yeet" option, found in the package.json file
  node server.js also works for production

The point of this server is to act as the API for the Autograder front end
  autograder. It handles communicating with the database, providing information
  on students, tests, and has grading feature when a student submits their answers

TODO: I need the database to actually come up
*/

//Some variables to set up for the server start
const {
  PORT =(process.env.PORT || 5000), //Where the server will go (?)
  NODE_ENV = 'development',
  SESS_NAME = 'sid', //Some cookie modifiers and attributes
  SESS_SECRET ='help',
  SESS_LIFETIME = TWO_HOURS
} = process.env
//For development, how to go to production
const IN_PROD = NODE_ENV === 'production'

//This is where the user database will go
const users = [
  { id: 1, name :'CJ Sloat', password: 'secret', grade : 0},
  { id: 2, name : 'Andrew Leaf', password: 'secret', grade : 0}
]

//This is where the test bank will go
const questions =
  [{ id : 1,
    test: [{id : 1, question: "8 + 2 = ?", a : 1, b : 10, c : 3, d : 4},
  { id: 2, question: "4 + 1 = ?", a : 1, b : 10, c : 5, d : 4,},
  { id: 3, question: "5 - 9 = ?", a : 1, b : 10, c : 3, d : -4,},
  { id: 4, question: "7 + 5 = ?", a : 12, b : 10, c : 3, d : 4,}],
  correct : ["b","c","d","a"]
}]


//Setting some cookie options
app.enable('trust proxy');
app.use(session({
  name: SESS_NAME,
  resave: false, //Will not save if nothing is modified
  saveUninitialized: false, //Will not save if uninitialized
  secret: SESS_SECRET,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite : true,
    secure: true
  }
}))

//Some setup in order to be able to parse json
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//On any request, this is some magic to make sure you can use CORS
  //(Cross-Origin Resource Sharing)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//Root page, idk might delete later
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname,'/dist/autograde/index.html'));
});
/*
Works to handle all login requests (both user and admin)

Grabs username and password from the front end (May want to hash later)
Check if admin -> if so, return return admin powers
  else, find the user in the database if they exist -> if so, 
    return user login success with user id
    else, return error
*/
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username == 'admin' && password == 'admin'){
    req.session.userID = 999 //Temp code for the admin, will need something better
    res.send({
      success: true,
      message: "admin"
    });
  } else{
    const user = users.find(
      user => user.name === username && user.password === password
    )
    if (user){
      req.session.userID = user.id
      res.send({
        success: true,
        message: "user"
      });
    }else{
      res.send({
        success: false,
        message: "Invalid credentials"
      }); 
    }
  }
});

/*
Placeholder code for when the database is in place

This handles getting user information per user request
Check to cookie for the ID
  if admin, return all user info
  if user, return user info
  else, return error
*/
app.get('/database', function(req, res) {
  thisID = req.session.userID
  if(thisID){
    if (thisID === 999){
      res.send(users)
    }else{
      const currUser = users.find(user => user.id === thisID)
      res.send(currUser);
    }
  }else{
    res.send({
      success: false,
      message: "idk you fucked up somewhere"
    });
  }
});

//Similar to above, except returns the test
//This will change a lot when database and test schedule is implemented
app.get('/test', function(req, res){
  thisID = req.session.userID
  if(thisID){
    res.send(questions[0]);
  }else{
    res.send({
      success: false,
      message: "idk you fucked up somewhere"
    });
  }
});

/*
This is the grader, it recieves the students answers, checks the database,
  and returns the correct grade (ideally)

First, the method checks to make sure the user is still logged in
  if the user is found -> parse incoming data, find test, compare answers
    and compute grade, then send it back
  else, return error
*/
app.post('/grader', function(req,res){
  thisID = req.session.userID
  if(thisID){
    const currUser = users.find(user => user.id === thisID)
    var answers = req.body.answers;
    var testID = req.body.testID;
    const test = questions.find(
      test => test.id === testID
    )
    const answerKey = test.correct
    var count = 0
    for (i = 0; i < answers.length; i++) { 
      if (answers[i] == answerKey[i]){
        count++;
      }
    }
    count = (count/4) * 100
    currUser.grade = count
    res.send({
      success : true,
      grade : count
    })
  } else{
    res.send({
      sucess : false,
      message : "Idk you fucked up"
    })
  }

});

/*
This checks to make sure the user is logged in at many different points
  of the application, trying my bestest to make sure no one can access
  the wrong page

Just checks the user id from the cookie and if that exists they are good to go
*/
app.get('/check', function(req,res){
  thisID = req.session.userID
  if (thisID === 999){
    res.send({
      success: true,
      message: "admin"
    })
  } else if (thisID){
    res.send({
      success: true,
      message: thisID
    })
  } else{
    res.send({
      success: false,
      message : "Not logged in"
    })
  }
});


//Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));