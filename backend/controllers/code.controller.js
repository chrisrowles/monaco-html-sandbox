const db = require('../models')
const Code = db.code
const Op = db.Sequelize.Op

exports.create = (req, res) => {
    const errors = []
    const required = ['name', 'content', 'link']
    required.forEach((key) => {
        if (!req.body[key]) errors.push(key)
    })

    if (errors.length > 0) {
        res.status(400).send({ message: 'Unable to save. the following is required: ' + errors.join(',') })
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
            if (!data) {
                res.status(404).send({
                    message: 'No codes found.'
                })
            }

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
            if (!data) {
                res.status(404).send({
                    message: 'Code not found.'
                })
            }

            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || 'An unexpected error occurred.'
            })
        })
}

exports.delete = (req, res) => {
    const name = req.params.name

    Code.destroy({ where: { name } })
        .then(result => {
            if (result === 1) {
                res.send({
                    message: 'Code successfully deleted.'
                })
            } else {
                res.send({
                    message: `Error deleting code ${name}`
                })
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'An unexpected error occurred'
            })
        })
}