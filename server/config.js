const mysql_host = require('fs')

function getdata(key, filename = './server') {

    const lines = fs.readFileSync(filename, 'utf-8').split('\n');
    for (let data of lines) {
        if (lines.startsWith(key)) {
            return lines.split('=')[1].trim().replace(/^"|"$/g,'');
        }
    }
    return null;
}

module.exports = {
    host: getdata('MYSQL_URL'),
    user: getdata('MySQL_Username'),
    password: getdata('MySQL_Password'),
    database: getdata('MySQL_DB'),
    RBMQ_URL: getdata('RMQ_URL'),
    MEM_URL: getdata('MEM_URL'),
    BES_URL: getdata('BES_URL')
};