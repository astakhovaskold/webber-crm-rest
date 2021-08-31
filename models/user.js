const {Schema, model} = require('mongoose') // подключаем класс Schema и функцию model() из mongoose

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    reset: {
        token: String,
        expires: Date
    },
    name: {
        first: {
            type: String,
            required: true
        },
        last: String,
        middle: String
    },
    birthday: Date,
    phone: String,
    city: String,
    price: Number,
    img: String,
    job: {
        type: Schema.Types.ObjectId,
        ref: 'Jobs'
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Roles'
    }
})

module.exports = model('User', user)