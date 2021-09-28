module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'localhost',
    name: 'skills_coverage',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}