const {Router} = require('express') // аналог const express.Router = require('express')
const User = require('../models/user')
const Customer = require('../models/customer')
const Service = require('../models/service')
const {validationResult} = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId
const router = Router()
const auth = require('../middleware/auth')
const func = require('./func/functions')
const { customersValidators } = require('../utils/validators')

router.get('/', auth, async (req, res) => {

    const user = await User.findById(req.session.user._id)
    const customers = await Customer.find({_id: {$in: user.customers}}) // выбираем клиентов, которые привязаны к пользователю

    // форматируем дату начала сотрудничества
    customers.forEach(customer => {
        customer.info.date = func.getFormattedDate(customer.info.dateFrom)
    })

    res.render('customers', {
        title: 'Клиенты',
        isCustomers: true,
        customers
    })
})

router.get('/add', auth, async (req, res) => {
    const services = await Service.find()

    res.render('customers/add', {
        title: 'Новый клиент',
        services,
        error: req.flash('error')
    })
})

router.post('/add', auth, customersValidators, async (req, res) => {

    const data = req.body

    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect('/customers/add')
    }

    data.projects = func.getJSONDataFromString(data.projects)

    if (data.dateFrom) {
        data.info = {...data.info, dateFrom: new Date(req.body.dateFrom)}
        delete data.dateFrom
    }

    if (req.files) {
        if (req.files.img) {
            delete data.img
            const path = await func.uploadUserImage(req.files.img)
            data.img = path
        }
    }

    const customer = new Customer(data)

    try {
        await customer.save() // вызываем метод класса Task для сохранения в БД

        const user = await User.findByIdAndUpdate(req.session.user._id)
        user.customers = user.customers.concat([customer._id])
        await user.save()

        // делаем редирект после отправки формы
        res.redirect('/customers')
    } catch (e) {
        console.log(e)
        res.end()
    }
})

router.get('/:id', auth, async (req, res) => {

    const customer = await Customer.findById(req.params.id).populate('service')
    const servicesDB = await Service.find()
    const services = servicesDB.filter(s => s._id.toString() !== customer.service._id.toString())
    const date = func.getFormattedDate(customer.info.dateFrom)

    customer.projects = JSON.stringify(customer.projects)

    res.render('customers/edit', {
        title: 'Редактирование карточки клиента',
        customer,
        services,
        date,
        error: req.flash('error')
    })
})

router.post('/edit', auth, customersValidators, async (req, res) => {
    const {id} = req.body // забираем id из объекта req.body в переменную

    const errors = validationResult(req) // получаем ошибки валдации (если есть)
    if (!errors.isEmpty()) { // если переменная с ошибками не пуста
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(`/customers/${id}`)
    }

    delete req.body.id // удаляем req.body.id, так как в MongoDB поле называется "_id", а в нашем запросе "id"

    const data = req.body

    data.projects = func.getJSONDataFromString(data.projects)
    data.info = { ...data.info, dateFrom: new Date(req.body.dateFrom) }
    delete data.dateFrom

    if (req.files) {
        if (req.files.img) {
            const path = await func.uploadUserImage(req.files.img)
            data.img = path
        }
    }

    await Customer.findByIdAndUpdate(id, data)
    res.redirect('/customers')
})

router.get('/:id/delete', auth, async (req, res) => {
    await Customer.findByIdAndRemove(req.params.id)

    const user = await User.findById(req.session.user._id)
    user.customers = user.customers.filter(c => c.toString() !== req.params.id.toString())
    await user.save()

    res.redirect('/customers')
})

router.get('/api/:id', async (req, res) => {
    const filed = req.query.field || ''
    const customer = await Customer.findById(req.params.id, filed)

    if (customer) {
        res.status(200).send(JSON.stringify(customer))
    }
})

module.exports = router