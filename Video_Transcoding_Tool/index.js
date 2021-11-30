const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
app.use(cors());
const net = require('net');
const fs = require('fs-extra');
const path = require('path');
const config = require(path.join(__dirname, './settings/config'));
const port = config.transcodingPort;
const ffmpeg = require('./ffmpeg');
const io = require('socket.io')(server, {
  cors: {
    orgin: '*',
  },
});

app.get('/', (req, res) => {
  res.json(`Transcoding Tool`);
});
app.get('/media/:stream/:quality', (req, res) => {
  res.sendFile(`/home/node/media/${req.params.stream}/${req.params.quality}`);
  // res.sendFile(`/home/user/Desktop/storage/${req.params.stream}/${req.params.quality}`);
});
server.listen(port, () => {
  console.log('server running on ', port);
});

let streamTotal = [];
const mediaPath = path.join('/home/node/media/');
//const mediaPath = path.join('/home/user/Desktop/storage/');
const streamFiles = async () => {
  try {
    await fs.ensureDir(mediaPath);
    const files = await fs.readdir(mediaPath);
    for (const file of files) {
      const pathExists = await fs.pathExists(
        `${mediaPath}/${file}/master.m3u8`,
      );

      if (pathExists) {
        const stats = await fs.stat(`${mediaPath}/${file}/master.m3u8`);

        // console.log(file,pathExists,stats.birthtime,'check')

        streamTotal.push({
          name: file,
          time: stats.birthtime,
        });
        // console.log(streamTotal)
      }
    }
  } catch (e) {
    console.log(e);
  }

  /* fs.readdir(mediaPath, (err, folder) => {
    if (err) {
      return console.log('no media folder is found', err);
    }
    console.log(folder)
/*     folder.forEach((stream) => {
      if (streamTotal.includes(stream) === true) {
        // console.log('stream already exists')
      } else {
        let masterExists = fs.existsSync(`${mediaPath}/${stream}/master.m3u8`);
        if (masterExists) {
          streamTotal.push(stream);
        }
      }
    });
  }); */
};
io.on('connection', async (socket) => {
  streamTotal = [];

  await streamFiles();
  console.log(streamTotal, 'after');
  socket.emit('playerLoaded', streamTotal);
  /*   streamFiles().then(() => {
    socket.emit('playerLoaded', streamTotal);
  }); */
});

//  io.sockets.emit('stream', streamTotal);
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
ffmpegConnection.on('data', async (data) => {
  // streamTotal.push(data.toString());

  console.log(data.toString(), 'check');
  streamId = data.toString();
  let streamName = streamId;
  let id = parseInt(streamId.match(/\d+/)[0]);

  /*  const checkStreamName = (streamName) => {
    if (streamTotal.includes(streamName)) {
      increaseNumber();
    } else {
      ffmpeg(streamName);
      socketEmit(streamName);
    }
  }; */
  const CheckExisting = () => {
    return streamTotal.find((id, index) => {
      if (id.name === streamName) {
        return true;
      }
    });
  };

  const increaseStreamId = async () => {
    id++;
    streamName = streamId.replace(/\d+/, id);
    console.log(CheckExisting(), 'check1');
    if (CheckExisting()) {
      increaseStreamId();
    } else {
      ffmpeg(streamName);
      socketEmit(streamName);
    }
  };

  let folders = await fs.readdir(mediaPath);

  console.log(folders.length);

  if (folders.length !== 0) {
    if (CheckExisting()) {
      increaseStreamId();
    } else {
      ffmpeg(streamName);
      socketEmit(streamName);
    }
  } else {
    ffmpeg(streamName);
    socketEmit(streamName);
  }
});
const socketEmit = (streamName) => {
  const intervalObj = setInterval(async () => {
    const file = `/home/node/media/${streamName}/master.m3u8`;
    // const file = `/home/user/Desktop/storage/${streamName}/master.m3u8`;
    try {
      const fileExists = await fs.pathExists(file);
      console.log(fileExists, 'check fileExists');
      const stats = await fs.stat(`${file}`);

      // let streamCreated;
      if (fileExists) {
        console.log('emit times');
        // streamTotal.push()
        io.sockets.emit('onStreamAdd', {
          name: streamName,
          time: stats.birthtime,
        });
        clearInterval(intervalObj);
      }
    } catch (e) {
      console.log(e, 'error');
    }
  }, 2000);
};
