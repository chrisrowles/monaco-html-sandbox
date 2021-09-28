module.exports = (sequelize, Sequelize) => {
    return sequelize.define('code', {
        name: {
            type: Sequelize.STRING
        },
        language: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.STRING
        },
        link: {
            type: Sequelize.STRING
        },
        created_on: {
            type: Sequelize.DATE
        },
        expires_on: {
            type: Sequelize.DATE
        }
    })
}