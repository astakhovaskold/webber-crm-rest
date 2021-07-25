const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const task = new Schema({
    name: {
        type: String,
        required: true
    },
    body: String,
    time: {
        estimate: Number,
        fact: Number,
        calc: {
            type: Number,
            default: 0
        }
    },
    states: {
        created: {
          type: Date,
          default: Date.now
        },
        modified: Date
    },
    roles: {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        developer: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        observers: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    },
    projectID: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    customerID: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    comments: [{
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        body: String,
        date: Date
    }],
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = model('Task', task) // экспортируем модель, передаём схему course