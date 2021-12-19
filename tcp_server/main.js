const net = require('net');
const config = require('./settings/tcpConfiguration.json')
const Proxyserver = net.createServer();
const connObj = [];
const obsSockets = [];
const clients = [];

Proxyserver.on('connection', (socket) => {
      console.log('connected from ' + socket.remoteAddress );
      obsSockets.push(socket);
      for (const conn of connObj) {
            const client = net.createConnection(
                  { port: parseInt(conn.port), host: conn.host },
                  () => {
                        client.write(`address:${socket.remoteAddress}`);
                        clients.push({
                              name: socket.remoteAddress,
                              socket: client,
                        });
                  },
            );
      }

      socket.on('data', (data) => {
            for (const clientsocket of clients) {
                  clientsocket.socket.write(data);
            }
      });
      socket.on('close', () => {
            console.log('client disconnected',socket.remoteAddress);
            if (obsSockets.includes(socket)) {
                  obsSockets.splice(obsSockets.indexOf(socket), 1);
            }
            for (const clientsocket of clients) {
                  clientsocket.socket.end();
                  const objs = clients.filter(
                        (obj) => obj.name === socket.remoteAddress,
                  );
                  for (const obj of objs) {
                        if (clients.includes(obj)) {
                              clients.splice(clients.indexOf(obj), 1);
                        }
                  }
            }
      });
});
Proxyserver.listen(config.ports.Main, '0.0.0.0', () => {
      console.log('server is running on port', config.ports.Main);
});

const server = net.createServer();

server.on('connection', (socket) => {
      console.log('new connection', socket.remoteAddress);

      socket.on('data', (data) => {
            if (data.toString().includes(':')) {
                  const info = {
                        host: socket.remoteAddress,
                        port: data.toString().split(':')[1],
                  };
                  connObj.push(info);
            }
      });
});

server.listen(config.ports.MainCom, '0.0.0.0', () => {
      console.log('server is running on port', config.ports.MainCom);
});
