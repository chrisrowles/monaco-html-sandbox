const baseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: true,
}

const herokuConfig = {
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}

let config
if (process.env.APP_ENV === 'local') {
    config = baseConfig
}

if (process.env.APP_ENV === 'heroku') {
    config = Object.assign({}, baseConfig, herokuConfig)
}

module.exports = config