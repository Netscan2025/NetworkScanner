const fs = require('fs')

function getdata(key, filename = '../server.txt') {

    const lines = fs.readFileSync(filename, 'utf-8').split('\n');
    for (let data of lines) {
        if (data.startsWith(key + '=')) {
            return data.split('=')[1].trim().replace(/^"|"$/g,'');
        }
    }
    console.warn(`⚠️  Key '${key}' not found in config file.`);
    return null;
}

module.exports = {
    host: getdata('MYSQL_URL'),
    user: getdata('MySQL_Username'),
    password: getdata('MySQL_Password'),
    database: getdata('MySQL_DB'),
    RBMQ_URL: getdata('RMQ_URL'),
    MEM_URL: getdata('MEM_URL')
};