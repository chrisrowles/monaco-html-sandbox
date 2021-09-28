const db = require('../models')
const Code = db.code
const Op = db.Sequelize.Op

exports.create = (req, res) => {
    const errors = []
    const required = ['name', 'language', 'content']
    required.forEach((key) => {
        if (!req.body[key]) errors.push(key)
    })

    if (errors.length > 0) {
        res.status(400).send({ message: 'Invalid Request. the following fields are required: ' + errors.join(',') })
        return
    }

    const record = req.body
    Code.create(record)
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
    const condition = req.params.name
        ? { name: req.params.name }
        : null

    Code.findOne({ where: condition })
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