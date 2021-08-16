/*
    создали middleware
*/

module.exports = function(req, res, next) {
    /*
        данный код добавляет в объект res переменную isAuth,
        которая будет доступна в каждом шаблоне .hbs
    */
    res.locals.isAuth = req.session.isAuthorized
    res.locals.user = req.session.user
    next()
}