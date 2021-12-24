const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'book_review_db',
    user: 'root',
    password: ''
})

module.exports = connection;