const db = require('../models')
const Code = db.code
const Op = db.Sequelize.Op

exports.create = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({
            message: 'Invalid Request'
        })

        return
    }

    const code = {
        code: req.body.code
    }

    Code.create(code)
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || 'An unexpected error occurred'
            })
        })
}

exports.all = (req, res) => {
    const name = req.query.name
    let condition = name ? { name: { [Op.like]: `%${name}%` } } : null

    Code.findAll({ where: condition })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || 'An unexpected error occurred'
            })
        })
}

exports.single = (req, res) => {
    const id = req.params.id

    Code.findByPk(id)
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'An unexpected error occurred'
            })
        })
}

exports.delete = (req, res) => {
    const id = req.params.id

    Code.destroy({ where: { id: id } })
        .then(result => {
            if (result === 1) {
                res.send({
                    message: 'User successfully deleted'
                })
            } else {
                res.send({
                    message: `Error deleting user ${id}`
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'An unexpected error occurred'
            })
        })
}