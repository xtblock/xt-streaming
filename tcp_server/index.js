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
    console.log(ffmpegSockets.indexOf(socket),'ffmpeg push')
  } else {
    obsSockets.push(socket);
    streamId++;
    ffmpegSockets[0].write(`stream${streamId}`);
    // console.log(ffmpegSockets.indexOf(socket),'ffmpeg ')
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

  socket.once('end',()=>{
    if(ffmpegSockets.includes(socket)){
     const  index= ffmpegSockets.indexOf(socket)
     ffmpegSockets.splice(index,1)
     console.log('disconnected from transcodingTool');
     process.exit(0);
    }

  })
});


// removing obs socket from server
const obsSocketRemove = (socketIndex) => {
   console.log(obsSockets[socketIndex].remoteAddress, "obs connection has been closed");
  //  obsSockets[socketIndex].destroy();
  if(obsSockets[socketIndex] !== undefined){
    obsSockets[socketIndex].destroy();
    obsSockets.splice(socketIndex, 1);  
  }
};

// removing FFMPEG socket from server

const ffmpegSocketRemove = (socketIndex) => {
  
  console.log(ffmpegSockets[socketIndex].remoteAddress,"ffmpeg connection has been closed");
  if(ffmpegSockets[socketIndex]!== undefined){
    ffmpegSockets[socketIndex].destroy();
    ffmpegSockets.splice(socketIndex, 1);
}
};

tcpServer.listen(port, '0.0.0.0', () => {
  console.log(`TCP Server listening on port ${port}`);
});
