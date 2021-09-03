var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root123',
    database : 'simplechat'
});

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

var http = require("http").createServer(app);
var io = require("socket.io")(http);

let users = [];

function joinUser(socketId, userName) {
    const user = {
        socketID: socketId,
        username: userName
    }
    users.push(user);
    return user;
}

function removeUser(id) {
    const getID = (users) => users.socketID === id;
    const idx = users.findIndex(getID);
    if (idx !== -1) {
        return users.splice(idx, 1)[0];
    }
}

function refresh(socket) {
    connection.query('SELECT username, message, date FROM messages ORDER BY id DESC LIMIT 50', function (error, results) {
       if (error) {
           console.log(error);
       } else {
           socket.emit('refresh', {messages: results.reverse()});
       }
    });
}

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/Login.html'));
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results) {
        if (results.length > 0) {
            request.session.loggedin = true;
            request.session.username = username;
            response.redirect('/chatroom');
        } else {
            response.send('Incorrect Username and/or Password!');
        }
        response.end();
    });
});

app.get('/reg', function(request, response) {
    response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/register', function(request, response) {
    var username = request.body.username;
    var password0 = request.body.password0;
    var password1 = request.body.password1;
    if (password0 !== password1) {
        response.send('Unknown browser error, please check your browser again!');
    }
    connection.query('SELECT * FROM accounts WHERE username = ?', [username], function(error, results) {
        if (results.length > 0) {
            response.send('Existing username!');
        } else {
            connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, \'NA\')', [username, password0]);
            response.redirect('/');
        }
        response.end();
    });
});

app.get('/chatroom', function(request, response) {
    if (request.session.loggedin) {
        console.log(request.session.username + " online");
        response.sendFile(path.join(__dirname + '/../Client/ChatRoom.html'));
        io.on("connection", function (socket) {
            joinUser(socket.id, request.session.username);
            refresh(socket);
            socket.on('send_message', function (data) {
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes();
                var dateTime = date+' '+time;
                connection.query('INSERT INTO messages (username, message, date) VALUES (?, ?, ?)',
                    [request.session.username, data.message, dateTime]);
                users.forEach(function (u) {refresh(io.sockets.sockets.get(u.socketID));});
            });
            socket.on('logout', function (data) {
                console.log(request.session.username + " offline")
                removeUser(socket.id);
            })
        })
    } else {
        response.redirect('/');
    }
});

http.listen(3000);