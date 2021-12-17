// dependencies import

const net = require('net');
const events = require('events');
const sub = () => {
      // config imports
      const tcpConfiguration = require('./settings/tcpConfiguration.json');
      const mainTcpIp = tcpConfiguration.main_tcp;
      const mainTcpPort = tcpConfiguration.ports.main_server;
      const mainTcpComPort = tcpConfiguration.ports.main_communication_server;
      const sub_communication_server =
            tcpConfiguration.ports.sub_communication_server;
      const sub_tcpPort = tcpConfiguration.ports.sub_tcp;
      // create an eventEmitter object
      const eventEmitter = new events.EventEmitter();

      // network info
      const networkInfo = require('./networkService')[0];

      // Array of all the sockets connected to the server

      // Array of all IP connected to the server

      // All server ports

      const subServer = net.createServer();

      const transcommSocks = [];
      const ffmpegSocks = [];
      // Client creations

      const subClientCom = net.createConnection({
            port: mainTcpComPort,
            host: mainTcpIp,
      });

      // Server Creation

      // All methods

      // _ip address validator_
      const regexExp =
            /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;

      // sub tcp client

      subClientCom.on('connect', () => {
            console.log(`connection successful to Main Tcp communication port`);
            subClientCom.write(networkInfo);
      });
      subClientCom.on('data', (data) => {
            console.log(data.toString(), 'check');
            if (data.toString() === 'create_connection_to_main_tcp_server') {
                  console.log('connection to Main server is initiated ');
                  startConnection();
            } else {
                  eventEmitter.emit('sendIp', data);
            }
      });
      subClientCom.on('error', (err) => {
            console.log(err.code, 'from sub client');
      });

      const startConnection = () => {
            const subDataReciever = net.createConnection({
                  port: mainTcpPort,
                  host: mainTcpIp,
            });

            subDataReciever.on('connect', () => {
                  console.log(`connection successful to Sub Tcp `);
            });
            subDataReciever.on('data', (data) => {
                  if (data.toString() === 'close') {
                        subDataReciever.emit('end');
                  } else {
                        // console.log(data)
                        eventEmitter.emit('sendData', data);
                  }
            });
            eventEmitter.on('endObs', (data) => {
                  console.log('endObs', data.toString());
                  subDataReciever.write(data);
            });
            subDataReciever.on('end', () => {
                  console.log('end');
                  subDataReciever.end();
                  eventEmitter.emit('close');
                  startConnection();
            });
      };

      // data forwarder to ffmpeg

      const transcomm = net.createServer();

      transcomm.on('connection', (socket) => {
            console.log('connection from transcomm');
            transcommSocks.push(socket);
            eventEmitter.on('sendIp', (ip) => {
                  transcommSocks.forEach((socket) => {
                        socket.write(ip);
                  });
            });
            socket.on('data', (data) => {
                  eventEmitter.emit('endObs', data);
            });

            socket.on('close', () => {
                  transcommSocks.splice(transcommSocks.indexOf(socket), 1);
                  console.log('end', transcommSocks);
            });
      });
      transcomm.listen(sub_communication_server, '0.0.0.0', () => {
            console.log(
                  'transcomm server is listening on port ',
                  sub_communication_server,
            );
      });

      subServer.on('connection', (socket) => {
            console.log('new connection from sub server', socket.remoteAddress);
            ffmpegSocks.push(socket);
            eventEmitter.on('sendData', (data) => {
                  // console.log(data)
                  ffmpegSocks.forEach((socket) => {
                        socket.write(data);
                  });
            });
            eventEmitter.on('close', () => {
                  ffmpegSocks.forEach((socket) => {
                        socket.destroy();
                  });
            });
      });
      subServer.listen(sub_tcpPort, '0.0.0.0', () => {
            console.log('sub server is listening on port ', sub_tcpPort);
      });
};
module.exports = sub;
