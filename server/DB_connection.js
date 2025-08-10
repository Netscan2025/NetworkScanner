const mysql = require('mysql2');
const creds = require('../server/config');
const connection = mysql.createConnection({
    host: creds.host,
    user: creds.user,
    password: creds.password,
    database: creds.database
});

module.exports = connection;