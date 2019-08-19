const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const StudentSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    period : {
        type: String,
        required : true
    },
    grade: {
        type: Array,
        default : [[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]]
    },
    correct: {
        type: Array,
        default : [[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]]
    },
    mastery : {
        type : Array,
        default : ["No","No","No","No","No","No","No","No","No","No","No","No","No","No","No"]
    },
    quiz : {
        type: Array,
        default : [0,0]
    },
    queue : {
        type : Array,
        default : []
    },
    enabled : {
        type : Boolean,
        default : true
    },
    average : {
        type : Number,
        default : 0
    },
    markingPeriods : {
        type : Array,
        default : []
    },
    markingQuizzes : {
        type : Array,
        default : [[0,0]]
    }
});

module.exports = Student = mongoose.model('student',StudentSchema);