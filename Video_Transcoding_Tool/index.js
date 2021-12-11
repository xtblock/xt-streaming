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
streamTotal=[]
const fileExists = await streamFiles();
console.log(fileExists, 'check fileExists');
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
ffmpegConnection.on('data', (data) => {
  // streamTotal.push(data.toString());

  console.log(data.toString(), 'check');
  streamId = data.toString();
  let streamName = streamId;
  let id = parseInt(streamId.match(/\d+/)[0]);

  // streamName = streamId.replace(/\d+/, id);

  const idExistsAlready = (streamName) => {
    for (const id of streamTotal) {
      if (id.name === streamName) {
        return true;
      } else {
        return false;
      }
    }
  };
  const checkStreamExists = () => {
    if (idExistsAlready(streamName)) {
      streamName = streamId.replace(/\d+/, id);
      id++;
      checkStreamExists();
    } else {
      ffmpeg(streamName);
      socketEmit(streamName);
    }
  };
  checkStreamExists();
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
         streamTotal.push({
          name: streamName,
          time: stats.birthtime,
        })
        io.sockets.emit('onStreamAdd', streamTotal);
        clearInterval(intervalObj);
      }
    } catch (e) {
      console.log(e, 'error');
    }
  }, 2000);
};
