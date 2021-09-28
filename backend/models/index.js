const { Sequelize } = require('sequelize')
// const config = require('../db.config') // this is for mysql, cba to install it locally, so just use sqlite for now
// const path = require("path");
// Create a new instance
// sqlite3
// const connection = new Sequelize({
//     dialect: 'sqlite',
//     storage: path.join(__dirname, '../storage/vscp.sqlite')
// })

// postgres
const connection = new Sequelize({
    host: 'ec2-176-34-222-188.eu-west-1.compute.amazonaws.com',
    port: '5432',
    username: 'wytvgvnxqrfkcw',
    password: '28f127832d8845d0699298545e3a9be3842ff4a666a7ccccfd643359bd547717',
    database: 'dfh8b0frirob0j',
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    logging: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

const db = {}

db.Sequelize = Sequelize
db.connection = connection

// Define database models
db.code = require('./code.model')(connection, Sequelize)

module.exports = db