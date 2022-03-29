// подключаем функцию проверки body из пакета express-validator

const bcrypt = require('bcryptjs');
const { body } = require('express-validator');

const User = require('../models/user');

exports.registerValidators = [
    body(['email'])
        .isEmail()
        .withMessage('Введите корректный Email')
        .custom(async value => {
            try {
                // ищем пользователя с полученным email
                const user = await User.findOne({ email: value });
                // если пользователь найден

                if (user?.email === value) {
                    return Promise.reject(new Error('Такой email уже занят'));
                }

                return Promise.resolve();
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(), // санитайзер, нормализует Email
    body('password')
        .isLength({ min: 8, max: 32 })
        .withMessage('Пароль должен быть минимум 8 символов')
        .isAlphanumeric()
        .withMessage('Пароль может включать в себя буквы и цифры')
        .trim(), // санитайзер trim, удаляет пробелы по краям
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать');
            }
            return true;
        })
        .trim(),

    /*
        валидируем имя
     */
    body('name').isLength({ min: 3 }).withMessage('Имя должно включать минимум 3 символа').trim(),
];

exports.loginValidators = [
    body('email')
        .if(body('email').isEmail().withMessage('Введите корректный Email').normalizeEmail())
        .custom(async value => {
            try {
                // ищем пользователя с полученным email
                const user = await User.findOne({ email: value });
                if (!user) {
                    // если пользователь НЕ найден
                    return Promise.reject('Такого пользователя не существует');
                }

                return Promise.resolve();
            } catch (e) {
                console.log(e);
            }
        }),
    body('password', 'Пароль должен быть минимум 8 символов')
        .isLength({ min: 8, max: 32 })
        .isAlphanumeric()
        .trim() // санитайзер trim, удаляет пробелы по краям
        .custom(async (value, { req }) => {
            try {
                // ищем пользователя с полученным email
                const { email } = req.body;
                const user = await User.findOne({ email });

                if (user) {
                    const compare = await bcrypt.compare(value, user.password);
                    if (!compare) {
                        // если пароль не верный
                        return Promise.reject('Неверный пароль');
                    }
                } else {
                    return Promise.reject('Пользователь с таким email не найден');
                }

                return Promise.resolve();
            } catch (e) {
                console.log(e);
            }
        }),
];

exports.taskValidators = [
    body('title', 'Название и тело задачи должно быть длинее 3 символов').isLength({ min: 3 }).trim(),
    // body(['customer', 'project'], 'Поля "Клиент" и "Проект" обязательны для заполнения').isLength({ min: 1 }).trim(),
];

exports.taskValidatorsEdit = [
    ...this.taskValidators,
    body('role')
        .isLength({ min: 1 })
        .withMessage('Произошла ошибка, попробуйте ещё раз')
        .custom(value => {
            if (value > 1) {
                throw new Error('Произошла ошибка, попробуйте ещё раз');
            }
            return true;
        }),
    body('estimate', 'Поле оценки задачи должно быть заполнено')
        .isLength({ min: 1 })
        .custom((value, { req }) => {
            if (req.body.role > 1 || !value) {
                throw new Error('Произошла ошибка, попробуйте ещё раз');
            }
            return true;
        }),
];

exports.customersValidators = [
    body('name', 'Наименование не должно быть пустым').isLength({ min: 1 }),
    body('price')
        .isLength({ min: 3 })
        .withMessage('Цена должна быть от 3 символов')
        .isNumeric()
        .withMessage('Цена должна содержать только цифры')
        .trim(),
];

exports.customersValidatorsEdit = [
    body('name').if(body('name')).isLength({ min: 1 }).withMessage('Наименование не должно быть пустым'),
    body('price')
        .if(body('price'))
        .isLength({ min: 3 })
        .withMessage('Цена должна быть от 3 символов')
        .isNumeric()
        .withMessage('Цена должна содержать только цифры')
        .trim(),
];

exports.usersValidators = [
    body('firstname', 'Имя не должно быть пустым').isLength({ min: 1 }).trim(),
    body('email')
        .isEmail()
        .withMessage('Введите корректный Email')
        .custom(async (value, { req }) => {
            try {
                const { email } = req.session.user;
                // ищем пользователя с полученным email
                const candidate = await User.findOne({ email: value });
                if (candidate && candidate.email !== email) {
                    // если пользователь найден И этот пользователь не текущий
                    return Promise.reject('Этот email уже занят');
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(), // санитайзер, нормализует Email
];
