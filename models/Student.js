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
    grade: {
        type: Number,
        default : 0
    },
    quiz : {
        type: String,
        default : "00"
    }
});

module.exports = Student = mongoose.model('student',StudentSchema);