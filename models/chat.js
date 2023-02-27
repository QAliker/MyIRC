const Sequelize = require("sequelize")

// models et colonne de la DB
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("chat", {
        name: Sequelize.STRING,
        message: Sequelize.STRING,
        room: Sequelize.STRING
    })
}