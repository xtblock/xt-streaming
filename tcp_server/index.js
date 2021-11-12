//modules Import
const net = require('net');
const tcpServer = net.createServer();
const setting = require('./settings/config.json');
const port = setting.tcpPort;
const transcodingToolUrl = setting.transcodingAddress;

// connections

let obsSockets = [];
let ffmpegSockets = [];
let streamId = 0;
// connection emit when client is connected

tcpServer.on('connection', (socket) => {
  console.log(socket.remoteAddress, 'connection');
  if (transcodingToolUrl === `${socket.remoteAddress}`) {
    ffmpegSockets.push(socket);
    //if(socket===ffmpegSockets[0]){ socket.write(`stream${streamId}`) }
  } else {
    obsSockets.push(socket);
    streamId++;
    ffmpegSockets[0].write(`stream${streamId}`);
  }

  // data writing from obs-studio to transcoding

  socket.on('data', (data) => {
    if (obsSockets.includes(socket)) {
      let i = obsSockets.indexOf(socket) + 1;
      if (ffmpegSockets[i] !== undefined) {
        ffmpegSockets[i].write(data);
      }
    }
  });

  // emited when obs connection is closed

  socket.once('close', () => {
    if (obsSockets.includes(socket)) {
      socketIndex = obsSockets.indexOf(socket);
      obsSocketRemove(socketIndex);
      ffmpegSocketRemove(socketIndex + 1);
    }
  });
});

// removing obs socket from server
const obsSocketRemove = (socketIndex) => {
  //  obsSockets[socketIndex].destroy();
  obsSockets.splice(socketIndex, 1);
  // console.log(obsSockets[socketIndex].remoteAddress, "connection has been closed");
};

// removing FFMPEG socket from server

const ffmpegSocketRemove = (socketIndex) => {
  ffmpegSockets[socketIndex].destroy();
  ffmpegSockets.splice(socketIndex, 1);
  //console.log(ffmpegSockets[socketIndex].remoteAddress,"connection has been closed");
};

tcpServer.listen(port, '0.0.0.0', () => {
  console.log(`TCP Server listening on port ${port}`);
});
