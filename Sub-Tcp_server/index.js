const net = require('net');
const main = require('./main');
const sub = require('./sub');
const config = require('./settings/tcpConfiguration.json');
const networkInfo = require('./networkService');
console.log(networkInfo);

// check for main or sub

const checkMain = net.createConnection(
      config.ports.main_communication_server,
      config.main_tcp,
      () => {
            console.log(`connection successful to Main Tcp `);
            sub();
      },
);

checkMain.on('error', (err) => {
      console.log(err.code);
      if (err.code === 'ECONNREFUSED') {
            main();
      }
});
