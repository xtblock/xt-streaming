// dependencies imports
const net = require('net');
var events = require('events');

//config file import
//  const streamConfig = require('./settings/streamConfig.json');
const tcpConfiguration = require('./settings/tcpConfiguration.json');

// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();

// Array of all the sockets connected to the server
const obsSockets = [];
const tcpSockets = [];
const subTcpComunicationSocket = [];

// Array of all IP connected to the server

const subTcpIpAddress = [];

// Server Creation

const communicationServer = net.createServer();
const mainServer = net.createServer();
// All server ports
const port = tcpConfiguration.ports;

// All methods

const main = () => {
      // Main Communication Server

      communicationServer.on('connection', (socket) => {
            // add to subTcpComunicationSocket
            subTcpComunicationSocket.push(socket);
            socket.write('create_connection_to_main_tcp_server');
            subTcpIpAddress.push(socket.remoteAddress);

            // if connection established from sub tcp server

            //need to add emit event to main tcp server
            eventEmitter.on('sendStreamData', (videoData) => {
                  // send video data to all the sub tcp server
                  subTcpComunicationSocket.forEach((socket) => {
                        socket.write(videoData);
                  });
            });
      });
      communicationServer.on('error', (err) => {
            console.log('Error in communication server in Mainjs', err.code);
      });

      communicationServer.listen(
            port.main_communication_server,
            '0.0.0.0',
            () => {
                  console.log(
                        `Main Communication Server is listening on port ${port.main_communication_server}`,
                  );
            },
      );

      // Main TCP Server

      mainServer.on('connection', (socket) => {
            console.log(
                  'new connection from main server',
                  socket.remoteAddress,
            );
            const streamKey = socket.remoteAddress;
            const videoData = streamKey;
            if (subTcpIpAddress.includes(socket.remoteAddress)) {
                  tcpSockets.push(socket);
            } else {
                  obsSockets.push(socket);

                  // event emit for stream data to sub tcp Server
                  eventEmitter.emit('sendStreamData', videoData);
            }

            socket.on('data', (data) => {
                  if (data.toString() === 'endObs') {
                       obsSockets.forEach((socket) => {
                                  socket.end();
                                  console.log('endObs');
                       });
                  }

                  // writing data to all sub tcp sockets

                  tcpSockets.forEach((socket) => {
                        socket.write(data);
                  });
            });

            socket.on('end', () => {
                  console.log('connection ended');
                  // remove socket from obs sockets array
                   obsSockets.splice(obsSockets.indexOf(socket), 1);
                  // end all sub tcp sockets and remove from tcp socket array
                  tcpSockets.forEach((socket) => {
                        tcpSockets.splice(tcpSockets.indexOf(socket), 1);
                        socket.destroy();
                  });
            });
      });

      mainServer.on('error', (err) => {
            console.log('error from main server', err.code);
      });

      mainServer.listen(port.main_server, '0.0.0.0', () => {
            console.log(`main server listening on port ${port.main_server}`);
      });
};

main();
