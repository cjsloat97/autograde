//Author - CJ Sloat cjsloat97@gmail.com

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Crypto = require('crypto-js')
var path = require('path');

const app = express();
app.use(express.static('./dist/autograde'));

const Student = require('./models/Student');
const Quizes = require('./models/Quiz');

const TWO_HOURS = 1000 * 60 * 60 * 2
/* 
Hi - I have no idea what webdev is

This is the node JS backend - to run in dev mode run "npm run yeet"
  this runs the "yeet" option, found in the package.json file
  node server.js also works for production

The point of this server is to act as the API for the Autograder front end
  autograder. It handles communicating with the database, providing information
  on students, tests, and has grading feature when a student submits their answers

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
  PORT = (process.env.PORT || 5000), //Where the server will go (?)
  NODE_ENV = 'development',
  SESS_NAME = 'sid', //Some cookie modifiers and attributes
  SESS_SECRET = 'help',
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
  proxy: true,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: false
  }
}));


//Some setup in order to be able to parse json
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//On any request, this is some magic to make sure you can use CORS
//(Cross-Origin Resource Sharing)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");//Might need to change to https://autograderer.herokuapp.com on launch
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//MongoDB new student registration
app.post('/api/database', function (req, res) {
  thisID = req.session.userID;
  var name = req.body.username;
  var ID = req.body.period;
  //var pass = "secret"; //Add some hash code to 
  var pass = Crypto.SHA3(name, { outputLength: 32 }).toString();
  if (thisID === 999) {
    if (name == "blank") {
      Quizes.findOne({ name: "period" })//Makes a new period
        .then(function (result) {
          result.answers.push(ID);
          result.save();
          res.json({ success: true })
        })
    } else {
      Quizes.findOne({ name: "order" })
        .then(function (result) {
          var day = result.day
          const newStudent = new Student({
            user: name,
            period: ID,
            password: pass
          });
          for(var i = 0; i < day - 1; i++){
            newStudent.queue.push(result.order[i])
            newStudent.markingQuizzes.push(result.order[i])
            newStudent.correct[result.order[i][0]][result.order[i][1]] = 0
          }
          newStudent.quiz = result.order[i]
          newStudent.markingQuizzes.push(result.order[i])
          newStudent.save().then(student => res.json(student));
      });
    }
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//MongoDB advance test day
app.post('/api/advance', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Quizes.findOne({ name: "order" })
      .then(function (result) {
        quizOrder = result.order
        result.day += 1
        result.markModified('day')
        result.save()
        Student.find()
          .then(function (students) {
            for (i = 0; i < students.length; i++) {
              currentQuiz = students[i].quiz
              index = 0
              for (index; index < quizOrder.length; index++) {
                if (currentQuiz[0] == quizOrder[index][0] && currentQuiz[1] == quizOrder[index][1]) {
                  index += 1
                  break
                }
              }
              if (students[i].correct[currentQuiz[0]][currentQuiz[1]] != 100) {
                if (!students[i].queue.includes(currentQuiz))
                  students[i].queue.push(currentQuiz)
                students[i].markModified('queue')
              }
              if (students[i].grade[currentQuiz[0]][currentQuiz[1]] == null) {
                students[i].correct[currentQuiz[0]][currentQuiz[1]] = 0
                students[i].average = calculateAverage(students[i])
                students[i].markModified('average')
                students[i].markModified('correct')
              }
              while (true) {
                if (index >= quizOrder.length) {
                  index = 0
                  break
                }
                testCat = parseInt(quizOrder[index][0]) //Which topic
                if (students[i].mastery[testCat] != "Yes") { //Mastery in place
                  break
                }
                index += 1
              }
              students[i].quiz = quizOrder[index]
              students[i].markingQuizzes.push(students[i].quiz)
              students[i].markModified('markingQuizzes')
              students[i].save()
            }
          });
      }
      );
    res.send({
      success: true,
      message: "Day Advacned"
    });
  } else {
    res.send({
      success: false,
      message: "Failed - Day Not Advanced - Not Logged In"
    });
  }
});

//MongoDB student deletion
app.delete('/api/database/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Student.findById(req.params.id)
      .then(student => { student.remove().then(() => res.json({ success: true })) })
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//MongoDB period averages
app.get('/api/database/period/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    const newStudent = new Student({
      user: "Period " + req.params.id,
      period: req.params.id,
      password: "x"
    });
    Student.find()
      .then((students) => {//This is disgusting but i dont think i care
        count = 0
        for (var i = 0; i < students.length; i++) {
          if (students[i].period == req.params.id && students[i].enabled) {
            count += 1
            for (var j = 0; j < students[i].grade.length; j++) {
              for (var k = 0; k < students[i].grade[j].length; k++) {
                if (students[i].grade[j][k] != null) {
                  if (newStudent.grade[j][k] == null) {
                    newStudent.grade[j][k] = students[i].grade[j][k];
                  } else {
                    newStudent.grade[j][k] += students[i].grade[j][k];
                  }
                }
              }
            }
          }

        }
        for (var i = 0; i < newStudent.grade.length; i++) {//Averaging
          for (var j = 0; j < newStudent.grade[i].length; j++) {
            if (newStudent.grade[i][j] != null) {
              newStudent.grade[i][j] /= count;
            }
          }
        }
        res.send({
          success: true,
          student: newStudent,
          message: "success"
        });
      }
      );
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//Calculate marking periods
app.post('/api/marking', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Quizes.findOne({ name: "order" })
      .then(function (result) {
        Student.find()
          .then(function (students) {
            for (var i = 0; i < students.length; i++) {//Empties out the current queue and resets certain arrays
              students[i].markingPeriods.push(Math.round(students[i].average * 100) / 100)
              students[i].markingQuizzes = []
              students[i].markingQuizzes.push(students[i].quiz)
              for (var j = 0; j < students[i].queue.length; j++) {
                students[i].grade[students[i].queue[j][0]][students[i].queue[j][1]] = 0
              }
              students[i].queue = []
              students[i].markModified("markingPeriods")
              students[i].markModified("markingQuizzes")
              students[i].markModified("grade")
              students[i].save()
            }
            res.send({
              success: true,
              message: "Marking Period Ended"
            });
          });
      });
  } else {
    res.send({
      success: false,
      message: "Not logged in as admin"
    });
  }
});


//MongoDB school year reset
app.delete('/api/reset', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Quizes.findOne({ name: "order" })
      .then(function (result) {
        Student.find()
          .then(students => {
            for (var i = 0; i < students.length; i++) {
              students[i].remove()
            }
            result.day = 1
            result.save()
            res.send({ success: true })
          })
      })
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//MongoDB period deletion
app.delete('/api/database/period/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Quizes.findOne({ name: "period" })
      .then(function (result) {
        for (var i = 0; i < result.answers.length; i++) {
          if (result.answers[i] == req.params.id) {
            result.answers.splice(i, 1)
            break
          }
        }
        result.markModified('answers')
        result.save();
        res.send({ success: true })
      })
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//MongoDB student edit information
app.post('/api/database/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Student.findById(req.params.id)
      .then(function (student) {
        student.user = req.body.nameChg
        student.period = req.body.periodChg
        student.enabled = req.body.enabledChg
        student.save()
        res.json({ success: true })
      }
      );
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

function correctQueue(student) {
  if (student.queue) {
    for (var i = 0; i < student.queue.length; i++) {
      var testID = student.queue[i]
      if (student.grade[testID[0]][testID[1]] == 100) {
        break
      }
      if (student.correct[testID[0]][testID[1]] == 100) {
        student.queue.splice(student.queue.indexOf(testID, 1))
        break
      }
    }
    student.markModified('queue')
  }
}

function calculateAverage(student) {
  var sum = 0
  for (var i = 0; i < student.markingQuizzes.length; i++) {
    sum += student.correct[student.markingQuizzes[i][0]][student.markingQuizzes[i][1]];
  }
  return sum / student.markingQuizzes.length;
}

function calculateMastery(student,testCat){
  topics = ['Fraction Operations','Fraction-Decimal-Percent',
  'Rounding','Add Integers','Subtract Integers','Multiply Integers',
  'Divide Integers','Unit Rate','Equivalent Ratios','Percent','Evalute Expressions'
  ,'Algebra-Words Translation','Simplify Expressions','1-Step Equations','2-Step  Equations']
  masteries = 0;
  for (var i = 0; i < 15; i++){
    if (student.grade[testCat][i] == 100){
      masteries += 1
      if (masteries == 4){
        for (i; i < 15; i++){
          student.grade[testCat][i] = 100;
          student.correct[testCat][i] = 100;
        }
        student.mastery[testCat] = "Yes"
        student.markModified('grade');
        student.markModified('correct');
        message = ("You have achieved mastery in " + topics[testCat] + "!");
        break;
      }
    }else if (student.grade[testCat][i] != null){
      masteries = 0
    }else{
      break;
    }
  }
  if (masteries != 4){
    student.mastery[testCat] = "No"
    message = ("You have " + masteries + " 100's in a row - " + (4 - masteries) + " to go for " + topics[testCat] + "!");
  }
  student.markModified('mastery');
  return message;
}


//MongoDB student edit grades
app.post('/api/database/grades/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Student.findById(req.params.id)
      .then(function (student) {
        if (req.body.first) {
          student.grade[req.body.index] = req.body.grades
          student.markModified('grade')
        } else {
          student.correct[req.body.index] = req.body.grades
          student.markModified('correct')
        }
        calculateMastery(student,req.body.index)
        correctQueue(student)
        student.save()
        res.json({ success: true })
      }
      );
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

//Get specific student info by id
app.get('/api/database/:id', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    Student.findById(req.params.id)
      .then(student => res.send(student));
  } else {
    res.send({
      success: false,
      message: "not admin"
    });
  }
});

/*
Works to handle all login requests (both user and admin)

Grabs username and password from the front end (May want to hash later)
Check if admin -> if so, return return admin powers
  else, find the user in the database if they exist -> if so, 
    return user login success with user id
    else, return error
*/
app.post('/api/login', function (req, res) {
  var username = req.body.username;
  var pass = req.body.password;
  req.session.userID = null;
  if (username == 'admin' && pass == 'adminlogin') {
    req.session.userID = 999 //Temp code for the admin, will need something better
    res.send({
      success: true,
      message: "admin"
    });
  } else {
    Student.findOne({ user: username, password: pass })
      .then(function (student) {
        if (student) {
          req.session.userID = student._id;
          res.send({
            success: true,
            message: "User"
          });
        } else {
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
app.get('/api/database', function (req, res) {
  thisID = req.session.userID
  if (thisID) {
    if (thisID === 999) {
      Quizes.findOne({ name: "order" })
        .then(order => {
          Quizes.findOne({ name: "period" })
            .then(function (period) {
              Student.find()
                .sort({ user: 1 })
                .then(students => res.json(
                  {
                    students,
                    period,
                    order
                  }
                ))
            })
        })

    } else {
      Student.findById(thisID)
        .then(function (student) {
          res.send(student);
        });
    }
  } else {
    res.send({
      success: false,
      message: "idk1"
    });
  }
});

/*
This is the grader, it recieves the students answers, checks the database,
  and returns the correct grade (ideally)

First, the method checks to make sure the user is still logged in
  if the user is found -> parse incoming data, find test, compare answers
    and compute grade, see if they have already taken the test,
    mark the first grade or the corrected grade, then send it back
  else, return error
*/
app.post("/api/grader", function (req, res) {
  thisID = req.session.userID;
  if (thisID) {
    Quizes.findOne({ name: "order" })
      .then(function (order) {
        Student.findById(thisID)
          .then(function (student) {
            var answers = req.body.answers;
            var testID = req.body.testID;
            Quizes.findOne({ name: testID })
              .then(function (quiz) {
                var message = "";
                const answerKey = quiz.answers;
                idParse = testID.split(",")
                testCat = parseInt(idParse[0]); //Which topic
                testNum = parseInt(idParse[1]); //Which number
                var count = 0;
                for (i = 0; i < answers.length; i++) { //Clean up the answer as best we can 
                  answers[i] = answers[i].trim();
                  temp = answers[i];
                  if (/\s/.test(answers[i])) {
                    temp = answers[i].replace(/\s\s+/g, " ");
                    temp = answers[i].replace(" ", "+")
                  }
                  try {
                    eval(temp);
                    eval(answerKey[i]);
                  } catch (error) {
                    temp = answers[i].replace(/\s\s+/g, " ");
                    if (temp == answerKey[i]) {
                      count += 1;
                    }
                    continue;
                  }
                  if (/\s/.test(answers[i])) {
                    temp = answers[i].replace(/\s\s+/g, " ");
                  }
                  if (eval(temp) == eval(answerKey[i])) {
                    count += 1;
                  }
                }
                count = (count / 4) * 100;

                if (student.grade[testCat][testNum] != null && student.correct[testCat][testNum] != 100) { //Corrections
                  student.correct[testCat][testNum] = count
                  student.average = calculateAverage(student)
                  student.markModified('average');
                  if (count == 100) {
                    student.queue.splice(student.queue.indexOf(testID), 1)
                    student.markModified('queue');
                  }
                  student.markModified('correct');
                  student.save();
                  res.send({
                    success: true,
                    grade: count,
                    corrected: true,
                    average: student.average
                  })
                } else if (student.grade[testCat][testNum] == null) { //First attempt
                  student.grade[testCat][testNum] = count
                  student.correct[testCat][testNum] = count
                  student.average = calculateAverage(student)
                  student.markModified('grade');
                  student.markModified('average');
                  student.markModified('correct');
                  if (count == 100) { //Condition for mastery goes here
                    if (student.queue.length != 0) {
                      student.queue.splice(student.queue.indexOf(testID), 1)
                    }
                    message = calculateMastery(student,testCat);
                  }
                  student.save();
                  res.send({
                    success: true,
                    grade: count,
                    corrected: false,
                    average: student.average,
                    message : message
                  })
                } else {
                  res.send({
                    grade: true
                  })
                }
              });
          });
      })
  } else {
    res.send({
      sucess: false,
      message: "Idk2"
    })
  }
});

/*
This checks to make sure the user is logged in at many different points
  of the application, trying my bestest to make sure no one can access
  the wrong page

Just checks the user id from the cookie and if that exists they are good to go
*/
app.get('/api/check', function (req, res) {
  thisID = req.session.userID
  if (thisID === 999) {
    res.send({
      success: true,
      message: "admin"
    })
  } else if (thisID) {
    Student.findById(thisID)
      .then(function (student) {
        res.send({ success: true, message: "Logged In", quiz: student.quiz, queue: student.queue, grades: student.grade, average: student.average });
      });
  } else {
    res.send({
      success: false,
      message: "Not logged in"
    })
  }
});

//Should serve angular files
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '/dist/autograde/index.html'));
});


//Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));