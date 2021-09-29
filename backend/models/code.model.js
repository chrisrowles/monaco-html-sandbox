module.exports = (sequelize, Sequelize) => {
    return sequelize.define('code', {
        name: {
            allowNull: false,
            unique: true,
            type: Sequelize.STRING
        },
        language: {
            allowNull: false,
            type: Sequelize.STRING
        },
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },
        link: {
            allowNull: false,
            type: Sequelize.STRING
        },
        expiresAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    })
}