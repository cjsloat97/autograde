const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const Quizchema = new Schema({
    name: {
        type: String,
        required: true
    },
    answers: {
        type: Array,
        required: true
    }
});

module.exports = Quizes = mongoose.model('quizes', Quizchema);