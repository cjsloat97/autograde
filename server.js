//Author - CJ Sloat cjsloat97@gmail.com

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');

const app = express();
app.use(express.static('./dist/autograde'));

const Student = require('./models/Student');
const Quizes = require('./models/Quiz');

const TWO_HOURS = 1000*60*60*2
/* 
Hi - I have no idea what webdev is

This is the node JS backend - to run in dev mode run "npm run yeet"
  this runs the "yeet" option, found in the package.json file
  node server.js also works for production

The point of this server is to act as the API for the Autograder front end
  autograder. It handles communicating with the database, providing information
  on students, tests, and has grading feature when a student submits their answers

TODO: I need the database to actually come up
*/

//Mongo Config
//This is in another file
const db = require('./config/keys').mongoURI;

//Connect to mongo
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


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

//Setting some cookie options
app.enable('trust proxy');
app.use(session({
  name: SESS_NAME,
  resave: false, //Will not save if nothing is modified
  saveUninitialized: false, //Will not save if uninitialized
  secret: SESS_SECRET,
  proxy : true,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite : true,
    secure: false
  }
}));

//Some setup in order to be able to parse json
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//On any request, this is some magic to make sure you can use CORS
  //(Cross-Origin Resource Sharing)
app.use(function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");//Might need to change to https://autograderer.herokuapp.com on launch
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//MongoDB new student registration
app.post('/api/database', function(req,res){
  thisID = req.session.userID
  var name = req.body.username;
  var ID = req.body.period; 
  var pass = "secret"; //Add some hash code to 
  if(thisID === 999){
    if(name == "blank"){
      Quizes.findOne({name : "period"})
        .then(function(result) {
          result.answers.push(ID);
          result.save();
      })
    }else{ 
      const newStudent = new Student({
        user : name,
        period : ID,
        password : pass
      });
      newStudent.save().then(student => res.json(student));
    }
  }else{
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//MongoDB advance test day
app.post('/api/advance', function(req,res){
  thisID = req.session.userID
  if(thisID === 999){
    Quizes.findOne({name : "order"})
      .then(function(result) {
        quizOrder = result.order
        Student.find()
        .then(function(students){
          for (i = 0; i < students.length; i++ ){
            currentQuiz = students[i].quiz
            index = quizOrder.indexOf(currentQuiz) + 1
            if (index >= quizOrder.length){
              index = 0
            }
            students[i].quiz = quizOrder[index]
            students[i].save()
          }
        });  
      }
      
    );

    res.send({
      success: true,
      message: "Day Advacned"
    });
  }else{
    res.send({
      success: false,
      message: "Failed - Day Not Advanced - Not Logged In"
    });
  }
});

//MongoDB student deletion
app.delete('/api/database/:id', function(req,res){
  thisID = req.session.userID
  if(thisID === 999){
    Student.findById(req.params.id)
      .then(student => {student.remove().then(() => res.json({success: true}))})
  }else{
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//Get specific student info by id
app.get('/api/database/:id', function(req,res){
  thisID = req.session.userID
  if(thisID === 999){
    Student.findById(req.params.id)
      .then(student => res.send(student));
  }else{
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//This is where the test bank will go
/*
const questions =
  [{ id : 1,
    test: [{id : 1, question: "8 + 2 = ?", a : 1, b : 10, c : 3, d : 4},
  { id: 2, question: "4 + 1 = ?", a : 1, b : 10, c : 5, d : 4,},
  { id: 3, question: "5 - 9 = ?", a : 1, b : 10, c : 3, d : -4,},
  { id: 4, question: "7 + 5 = ?", a : 12, b : 10, c : 3, d : 4,}],
  correct : ["b","c","d","a"]
}]
*/

/*
Works to handle all login requests (both user and admin)

Grabs username and password from the front end (May want to hash later)
Check if admin -> if so, return return admin powers
  else, find the user in the database if they exist -> if so, 
    return user login success with user id
    else, return error
*/
app.post('/api/login', function(req, res) {
  var username = req.body.username;
  var pass = req.body.password;
  req.session.userID = null;
  if (username == 'admin' && pass == 'admin'){
    req.session.userID = 999 //Temp code for the admin, will need something better
    res.send({
      success: true,
      message: "admin"
    });
  } else{
    Student.findOne({user : username, password : pass})
      .then(function(student){
        if (student){
          req.session.userID = student._id;
          res.send({
            success: true,
            message: "User"
          });
        }else{
          res.send({
            success: false,
            message: "Invalid credentials"
          }); 
        }
    });
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
app.get('/api/database', function(req, res) {
  thisID = req.session.userID
  if(thisID){
    if (thisID === 999){
      Quizes.findOne({name : "period"})
      .then(function(period) {    
        Student.find()
          .sort( {user : 1})
          .then(students => res.json(
            {
              students,
              period
            }
          ))
        })

    }else{
      Student.findById(thisID)
        .then(function(student){
          res.send(student);
      });
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
/*
app.get('/api/test', function(req, res){
  var testID = req.body.testID;
  var thisID = req.session.userID
  if(thisID){
    Quizes.findOne({name : testID})
    .then(function(quiz){
      if (quiz){
        req.session.userID = student._id;
        res.send({
          success: true,
          message: "User"
        });
      }else{
        res.send({
          success: false,
          message: "idk you fucked up somewhere"
        }); 
      }
    });
  }else{
    res.send({
      success: false,
      message: "idk you fucked up somewhere"
    });
  }
});
*/

/*
This is the grader, it recieves the students answers, checks the database,
  and returns the correct grade (ideally)

First, the method checks to make sure the user is still logged in
  if the user is found -> parse incoming data, find test, compare answers
    and compute grade, then send it back
  else, return error
*/
app.post('/api/grader', function(req,res){
  thisID = req.session.userID
  if(thisID){
    Student.findById(thisID)
      .then(function(student){
        var answers = req.body.answers;
        var testID = req.body.testID;
        Quizes.findOne({name : testID})
        .then(function(quiz){
          const answerKey = quiz.answers
          testCat = parseInt(testID[0]) //Which topic
          testNum = parseInt(testID[1]) //WHich number
          var count = 0
          for (i = 0; i < answers.length; i++) { 
            if (answers[i] == answerKey[i]){
              count++;
            }
          }
          count = (count/4) * 100
          if(student.grade[testCat][testNum] != null && student.correct[testCat][testNum] != 100){
            student.correct[testCat][testNum] = count
            student.markModified('correct');
            student.save();
            res.send({
              success : true,
              grade : count,
              corrected: true
            })
          }else if(student.grade[testCat][testNum] == null){
            student.grade[testCat][testNum] = count
            student.markModified('grade');
            student.save();
            res.send({
              success : true,
              grade : count,
              corrected: false
            })
          }else{
            res.send({
              grade : true
            })
          }
 
        });
        
    });   
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
app.get('/api/check', function(req,res){
  thisID = req.session.userID
  if (thisID === 999){
    res.send({
      success: true,
      message: "admin"
    })
  } else if (thisID){
      Student.findById(thisID)
      .then(function(student){
        res.send({success: true, message : "Logged In", quiz : student.quiz});
      });
  } else{
    res.send({
      success: false,
      message : "Not logged in"
    })
  }
});

//Should serve angular files
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname,'/dist/autograde/index.html'));
});


//Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));