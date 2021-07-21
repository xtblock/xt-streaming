var net = require('net');
var tcpServer = net.createServer();
const port = 8000;
const host = 'localhost';

var sockets = [];

//when connection is established
tcpServer.on('connection', function (socket) {
  console.log('connection established');
  sockets.push(socket);

  // send incoming stream to ffmpeg
  socket.on('data', function (data) {
    var clients = sockets.length;

    //to prevent data sending back to obs socket
    for (var i = 0; i < clients; i++) {
      if (sockets[i] === socket) continue;
      sockets[i].write(data);
    }
  });

  //when  streaming is stopped
  socket.once('close', function () {
    console.log(`streaming has been stopped`);
  });
  //to remove the  client from socket when straming is stopped
  socket.on('end', function () {
    sockets.splice(sockets.indexOf(socket), 1);
  });
  // when any error occurs in connection
  socket.on('error', function () {
    console.log(`connection error`);
  });
});

tcpServer.listen(port, host, function () {
  console.log(`server listening on ${host}:${port}`);
});
