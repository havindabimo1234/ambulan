const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()

const UsersecretKey = 'thisisverysecretkey'
const AdminsecretKey = 'thisisverysecretkey'

// menggunakan body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// cofig connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "ambulan"
})

// connection database
db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})


// token admin 
const isAuthorized = (req, res, next) => {

    if (typeof(req.headers['x-api-key']) == 'undefined') {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = req.headers['x-api-key']

    jwt.verify(token, AdminsecretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}


// token user
const Authorized = (request, result, next) => {

    if (typeof(request.headers['Authorized']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = request.headers['Authorized']

    jwt.verify(token, UsersecretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}

// endpoint untuk login user
app.post('/login/user', (request, result) => {
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

            if (results.length > 0) {
                let token = jwt.sign(data.username + '|' + data.password, UsersecretKey)

                result.json ({
                success: true,
                message: 'Login berhasil, hallo!',
                token: token
            });
        
            } else {
                result.json ({
                success: false,
                message: 'username atau password anda salah!!'
            });

            }
            result.end();
        });
    }
});

// endpoint untuk login admin
app.post('/login/admin', (request, result) => {
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

            if (results.length > 0) {
                let token = jwt.sign(data.username + '|' + data.password, AdminsecretKey)

                result.json ({
                success: true,
                message: 'Login berhasil, hallo!',
                token: token
            });
        
            } else {
                result.json ({
                success: false,
                message: 'username atau password anda salah!!'
            });

            }
            result.end();
        });
    }
});


// endpoint untuk registrasi
app.post('/registrasi', (request, result) => {
    let data = request.body

    let sql = `
        insert into user (nama_user, username, password, alamat, kontak, gender)
        values ('`+data.nama_user+`', '`+data.username+`', '`+data.password+`', '`+data.alamat+`', '`+data.kontak+`', '`+data.gender+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Registrasi berhasil'
    })
})

