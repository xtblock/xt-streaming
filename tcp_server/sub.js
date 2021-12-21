const net = require('net');
const events = require('events');
const Emmiter = new events.EventEmitter();

const mainConnection = net.connect(
      {
            port: 9000,
            host: '3.110.188.150',
      },
      () => {
            console.log('connected to TCP Server');
            mainConnection.once('end', () => {
                  console.log('disconnected from Main Server');
                  //process.exit(0);
            });
      },
);
mainConnection.on('data', (data) => {
      console.log(data.toString());
      if (data.toString().includes('start:')) {
            createConnection();
            for (const sockets of commSockets) {
                  sockets.write(data.toString().split(":")[1]);
            }

      }
});

const createConnection = () => {
      const client1 = net.connect({
            port: 8000,
            host: '3.110.188.150',
      });
      const client2 = net.connect({
            port: 9070,
            host: '127.0.0.1'
      }, () => { });
      client1.on('data',data=>client2.write(data))

      client1.on('end', () => {
            console.log('disconnected from main server');
            client2.end()
      })

};
const MainServer = net.createServer();
const SubServer = net.createServer();


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
      // sockets.write(`start:${socket.remoteAddress}`);
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

MainServer.listen(9070, '0.0.0.0', () => {
  console.log(`TCP Server listening on port 8000`);
});


SubServer.on('connection', (socket) => {
  console.log(socket.remoteAddress, 'connection');
  commSockets.push(socket)
  MainSocketsIp.push(socket.remoteAddress)
  infoSockets[socket.remoteAddress] = [];

})
SubServer.listen(9080, '0.0.0.0', () => {
  console.log(`Sub Server listening on port 9000`);
})
