const { Sequelize } = require('sequelize')
const config = require('../db.config')

// Postgres connection
const connection = new Sequelize(config)

const db = {}

db.Sequelize = Sequelize
db.connection = connection

// Models
db.code = require('./code.model')(connection, Sequelize)

module.exports = db