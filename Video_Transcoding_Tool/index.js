const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 8085;
const cors = require('cors');
app.use(cors());
const net = require('net');
const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, './settings/config'));
const ffmpeg = require('./ffmpeg');
const io = require('socket.io')(server, {
  cors: {
    orgin: '*',
  },
});

let numbersOfClients = [];

app.get('/', (req, res) => {
  res.json(`Transcoding Tool`);
});

app.get('/media/:stream/:quality', (req, res) => {
  res.sendFile(`/home/node/media/${req.params.stream}/${req.params.quality}`);
});

server.listen(port, () => {
  console.log('server running on ', port);
});

io.on('connection', (socket) => {
  // console.log("connected", socket.id);
  socket.emit('stream', numbersOfClients);
});

io.sockets.emit('stream', numbersOfClients);

const tcpServerUrl = new URL(config.tcp_address);

var ffmpegConnection = net.connect(
  {
    port: tcpServerUrl.port,
    host: tcpServerUrl.hostname,
  },
  () => {
    console.log('connected to TCP Server');
    ffmpegConnection.once('end', function () {
      console.log('disconnected from TCP Server');
      process.exit(0);
    });
  },
);

ffmpegConnection.on('data', (data) => {
  numbersOfClients.push(data.toString());
  console.log(data.toString());
  streamId = data.toString();
  const streamName = streamId;
  ffmpeg(streamName);

  const intervalObj = setInterval(function () {
    const file = `/home/node/media/${streamName}/master.m3u8`;
    const fileExists = fs.existsSync(file);

    if (fileExists) {
      io.sockets.emit('stream', numbersOfClients);
      clearInterval(intervalObj);
    }
  }, 2000);
});
