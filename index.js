var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis');
var redisClient = redis.createClient();

app.use(express.static('public'));

// var messages = [];
var storeMessage = function (name, data) {
    var message = JSON.stringify({ name, data });
    console.log(message);
    redisClient.lpush('messages', message, function (err, res) {
        redisClient.ltrim('messages', 0, 9);
    });
    // messages.push({ name, data });
    // if (messages.length > 10) {
    //     messages.shift();
    // }
};

io.on('connection', function (client) {
    console.log('Cient connected...');

    client.emit('messages', { hello: 'world' });

    client.on('join', function (name) {
        client.nickname = name;
        redisClient.lrange('messages', 0, -1, function (err, messages) {
            messages = messages.reverse();
            messages.forEach(function (message) {
                message = JSON.parse(message);
                client.emit('messages', message.name + ': ' + message.data);
            });
        });

        // Add new chatter
        client.broadcast.emit('add chatter', name);
        redisClient.smembers('chatters', function (err, names) {
            names.forEach(function (name) {
                client.emit('add chatter', name);
            });
        });
        redisClient.sadd('chatters', name);
    });

    client.on('messages', function (data) {
        var nickname = client.nickname;
        var message = nickname + ': ' + data;

        console.log(message);
        client.broadcast.emit('messages', message);
        client.emit('messages', '*' + message);
        storeMessage(nickname, data);
    });

    client.on('disconnect', function (name) {
        // client.get('nickname', function (err, name) {
            console.log('diss: '+client.nickname);
            client.broadcast.emit('remove chatter', client.nickname);
            redisClient.srem('chatters', client.nickname);
        // })
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(8080);
