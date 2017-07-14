var mongoDB_Client = require('mongodb').MongoClient,
    mongoDB_Connection = require('socket.io').listen(8080).sockets;

    mongoDB_Client.connect('mongodb://127.0.0.1/chat', function(error, db) {
        if (error) throw error;

        mongoDB_Connection.on('connection', function (socket) {
            var collections = db.collection('messages'),
                send = function (status) {
                    socket.emit('status', status);
                };

            collections.find().limit(100).sort({_id: 1}).toArray(function (error, msg) {
                if (error) throw error;
                socket.emit('output', msg);
            });

            socket.on('input', function (data) {
                var name = data.name,
                    message = data.message;

                    whitespacePattern = /^\s*$/;
                if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
                    send('Your name and message is required.');
                } else {
                    collections.insert({name: name, message: message}, function () {
                        mongoDB_Connection.emit('output', [data]);
                        send({
                            message: "Message sent",
                            clear: true
                        });
                    })
                }
            });
        });
    });