const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
app.use(cors());
const net = require('net');
const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, './settings/config'));
const port = config.transcodingPort;
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
const mediaPath = path.join('/home/node/media/')
const streamFiles = async() => {
	fs.readdir(mediaPath, (err, folder) => {
		if(err) {
			return console.log('no media folder is found', err)
		}
		folder.forEach(stream => {
			if(numbersOfClients.includes(stream) === true) {
				// console.log('stream already exists')
			} else {
				numbersOfClients.push(stream)
			}
		})
	})
}
io.on('connection', (socket) => {
	streamFiles().then(() => {
		socket.emit('playerLoaded', numbersOfClients);
	})
});
//  io.sockets.emit('stream', numbersOfClients);
const tcpServerUrl = new URL(config.tcp_address);
var ffmpegConnection = net.connect({
	port: tcpServerUrl.port,
	host: tcpServerUrl.hostname,
}, () => {
	console.log('connected to TCP Server');
	ffmpegConnection.once('end', function() {
		console.log('disconnected from TCP Server');
		process.exit(0);
	});
}, );
ffmpegConnection.on('data', (data) => {
	// numbersOfClients.push(data.toString());
  
	console.log(data.toString(), 'check');
	streamId = data.toString();
	let streamName = streamId;
  let id =parseInt(streamId.match(/\d+/)[0])
  const increaseNumber=()=>{
      id++
      streamName = streamId.replace(/\d+/,id)
      if(!(numbersOfClients.includes(streamName))){
        ffmpeg(streamName);
        socketEmit(streamName)
      }else{
        increaseNumber();
      }
  }   
  const checkStreamName=(streamName)=>{
    if(numbersOfClients.includes(streamName)){
      
      increaseNumber();
    } else{
      ffmpeg(streamName);
      socketEmit(streamName)
    }
  }
  checkStreamName(streamName)
});

const socketEmit=(streamName)=>{
  const intervalObj = setInterval(function() {
    const file = `/home/node/media/${streamName}/master.m3u8`;
    const fileExists = fs.existsSync(file);
    if(fileExists) {
      io.sockets.emit('onStreamAdd', streamName);
      clearInterval(intervalObj);
    }
  }, 2000);
}



