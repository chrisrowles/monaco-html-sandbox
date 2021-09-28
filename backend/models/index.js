const { Sequelize } = require('sequelize')
// const config = require('../db.config') // this is for mysql, cba to install it locally, so just use sqlite for now
const path = require("path");

// Create a new instance
const connection = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../storage/vscp.sqlite')
})

const db = {}

db.Sequelize = Sequelize
db.connection = connection

// Define database models
db.code = require('./code.model')(connection, Sequelize)

module.exports = db