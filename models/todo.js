const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    uId: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    priority: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        required: true,
    }
});

  
module.exports = mongoose.model('Todo', todoSchema)