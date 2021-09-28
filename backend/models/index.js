// The application database is pretty much entirely instantiated from here
const { Sequelize } = require('sequelize')
// const config = require('../db.config')
const path = require("path");

// Create a new instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../storage/vscp.sqlite')
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Define database models
db.code = require('./code.model')(sequelize, Sequelize)

module.exports = db