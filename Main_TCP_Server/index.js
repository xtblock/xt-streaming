//modules Import
const net = require('net');
const config = require('./config.json');
const MainServer = net.createServer();
const SubServer = net.createServer();
// connections
let infoSockets = {}
let obsSockets = [];
let tcpSockets = [];
let commSockets = [];
let MainSocketsIp = [];

// connection emit when client is connected

MainServer.on('connection', (socket) => {


  console.log(socket.remoteAddress, 'connection');

  if (MainSocketsIp.includes(socket.remoteAddress)) {
    tcpSockets.push(socket);
    console.log(tcpSockets.indexOf(socket), 'ffmpeg push');
    infoSockets[socket.remoteAddress].push(socket)


  } else {
    obsSockets.push(socket);
    console.log(socket.remoteAddress, 'obs push');
    for (const sockets of commSockets) {
      sockets.write(`start:${socket.remoteAddress}`);
    }
  }

  // data writing from obs-studio to transcoding

  socket.on('data', (data) => {
    if (obsSockets.includes(socket)) {
      let i = obsSockets.indexOf(socket)
      for (const ip of MainSocketsIp) {
        const Arrayfind = infoSockets[ip]
        if (Arrayfind[i] !== undefined) {
          Arrayfind[i].write(data)
        }
      }

    }
  });

  // emited when obs connection is closed

  socket.once('close', () => {
    if (obsSockets.includes(socket)) {
      socketIndex = obsSockets.indexOf(socket);
      obsSocketRemove(socketIndex);
      tcpSocket(socketIndex);
    }
  });

  socket.once('end', () => {
    if (tcpSockets.includes(socket)) {
      const index = tcpSockets.indexOf(socket);
      tcpSockets.splice(index, 1);

      for (const ip of MainSocketsIp) {
        const Arrayfind = infoSockets[ip]
        const index1 = Arrayfind.indexOf(socket);
        Arrayfind.splice(index1, 1)

      }

      console.log('disconnected from transcodingTool');
      // process.exit(0);
    }
  });
});

// removing obs socket from server
const obsSocketRemove = (socketIndex) => {
  console.log(
    obsSockets[socketIndex].remoteAddress,
    'obs connection has been closed',
  );
  //  obsSockets[socketIndex].destroy();
  if (obsSockets[socketIndex] !== undefined) {
    obsSockets[socketIndex].destroy();
    obsSockets.splice(socketIndex, 1);
  }
};

// removing FFMPEG socket from server

const tcpSocket = (socketIndex) => {

  if (tcpSockets[socketIndex] !== undefined) {
    console.log(
      tcpSockets[socketIndex].remoteAddress,
      'ffmpeg connection has been closed',
    );

    for (const ip of MainSocketsIp) {
      const Arrayfind = infoSockets[ip]

      Arrayfind[socketIndex].destroy()
      Arrayfind.splice(socketIndex, 1);
    }
    tcpSockets.splice(socketIndex, 1);

    console.log(infoSockets)
  }
};

MainServer.listen(config.mainServerPort, '0.0.0.0', () => {
  console.log(`TCP Server listening on port 8000`);
});


SubServer.on('connection', (socket) => {
  console.log(socket.remoteAddress, 'connection');
  commSockets.push(socket)
  MainSocketsIp.push(socket.remoteAddress)
  infoSockets[socket.remoteAddress] = [];

})
SubServer.listen(config.mainCommPort, '0.0.0.0', () => {
  console.log(`Sub Server listening on port 9000`);
})