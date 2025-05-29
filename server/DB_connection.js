const mysql = require('mysql2');
const creds = require('./config');
const connection = mysql.createConnection({
    host: cred.host,
    user: creds.user,
    password: creds.password,
    database: creds.database
});

module.exports = connection;