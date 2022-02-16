const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
app.use(cors());
const net = require('net');
const fs = require('fs-extra');
const path = require('path');
const config = require(path.join(__dirname, './settings/config'));
const port = config.broadcastingPort;
const ffmpeg = require('./ffmpeg');
const getData = require('./httpService');
const { getStreamData, editStreamData } = require('./jsonService');
const io = require('socket.io')(server, {
  cors: {
    orgin: '*',
  },
});
const networkInfo = require('./networkService')[0];
app.get('/', (req, res) => {
  res.json(`localhost:8085`);
});
app.get('/streamConfig', async (req, res) => {
  const file = await getStreamData();
  res.json(file);
});

app.get('/media/:channel/:stream/:quality', (req, res) => {
  res.sendFile(
    path.join(
      `/home/node/media/${req.params.channel}/${req.params.stream}/${req.params.quality}`,
    ),
  );
  // res.sendFile(`/home/user/Desktop/storage/${req.params.stream}/${req.params.quality}`);
});
server.listen(port, () => {
  console.log('server running on ', port);
});

let streamTotal = [];
const mediaPath = path.join('./media');

io.on('connection', (socket) => {
  console.log('new Connection');
  // const data = require('./streamConfig.json');
  socket.emit('playerLoaded', 'connected');
});

//  io.sockets.emit('stream', streamTotal);
const tcpServerUrl = new URL(config.tcp_Server_address);
var ffmpegConnection = net.createConnection(
  {
    port: config.tcp_communication_port,
    host: tcpServerUrl.hostname,
  },
  () => {
    console.log('connected to TCP Server');
    // ffmpegConnection.write(`${networkInfo}:${tcpServerUrl.port}`);
    ffmpegConnection.once('end', function () {
      console.log('disconnected from TCP Server');
      // process.exit(0);
    });
  },
);

ffmpegConnection.on('data', async (data) => {
  console.log(data.toString(), 'check');

  const videoConfig = await getStreamData();
  console.log(videoConfig);
  //   const json = videoConfig;

  const getVideoData = videoConfig.data.find(
    (obj) => obj.streamKey === data.toString(),
  );
  if (getVideoData !== undefined) {
    const getStreamName = getVideoData.streams.find(
      (name) => name.live === undefined,
    );
    if (getStreamName) {
      let streamId = getStreamName.streamingName;
      let channelName = getVideoData.channelName;
      let streamName = streamId;
      // let id = parseInt(streamId.match(/\d+/)[0]);

      ffmpeg(streamName, channelName);
      socketEmit(streamName, channelName);
    }
  } else {
    console.log('no stream key found ');
  }
});
const socketEmit = (streamName, ChannelName) => {
  const intervalObj = setInterval(async () => {
    const file = `/home/node/media/${ChannelName}/${streamName}/master.m3u8`;
    // const file = `/home/user/Desktop/storage/${streamName}/master.m3u8`;
    try {
      const fileExists = await fs.pathExists(file);
      const stats = await fs.stat(`${file}`);

      // let streamCreated;
      if (fileExists) {
        const data = {
          channel: ChannelName,
          name: streamName,
          time: Date.now(),
          live: true,
        };
        console.log(data);
        editStreamData('createTimeFrame', data);

        io.sockets.emit('onStreamAdd', {
          channelName: ChannelName,
          streamName: streamName,
        });
        clearInterval(intervalObj);
      }
    } catch (e) {
      console.log(e, 'error');
    }
  }, 2000);
};
