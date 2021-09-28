module.exports = app => {
    const code = require('../controllers/code.controller')
    const router = require('express').Router()

    router.post('/', code.create)
    router.get('/', code.all)
    router.get('/:id', code.single)
    router.delete('/:id', code.delete)

    app.use('/api/code', router)
}