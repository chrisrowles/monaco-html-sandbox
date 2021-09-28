const { Sequelize } = require('sequelize')
const config = require('../db.config')

// sqlite3
// const path = require('path')
// const connection = new Sequelize({
//     dialect: 'sqlite',
//     storage: path.join(__dirname, '../storage/vscp.sqlite')
// })

// postgres
const connection = new Sequelize(config)

const db = {}

db.Sequelize = Sequelize
db.connection = connection

// Define database models
db.code = require('./code.model')(connection, Sequelize)

module.exports = db