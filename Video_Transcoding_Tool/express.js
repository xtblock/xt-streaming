const express = require('express')
const app = express();
const cors = require('cors');
app.use(cors());
const path = require('path')
const config = require('./settings/transcoding_config.json');
const services = require('./services')

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    orgin: '*',
  },
});

const expressServer = ()=>{
    io.on('connection', (socket) => {
        console.log('new Connection', socket.id);
        socket.emit('playerLoaded', 'connected to Transcoding Tool');
      });
    app.get ('/transcoding',async(req,res)=>{
        const file = await services.getStreamConfig();
        res.json(file);
    })
    app.get('/media/:channel/:streamname/:quality', (req, res) => {
        let path = `/home/node/media/${req.params.channel}/${req.params.streamname}/${req.params.quality}`;
        res.sendFile(path);
      });

      server.listen(config.broadcasting_port, () => {
        console.log('Broadcasting is running on port ', config.broadcasting_port);
      });
}

module.exports.expressServer = expressServer;
module.exports.io = io;