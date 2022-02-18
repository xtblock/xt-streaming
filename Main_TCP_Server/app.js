const config = require('./settings/tcp_config.json')
const net = require('net');
const express = require('express')
const app = express();
const crypto = require('crypto');
const httpserver = require('http').createServer(app);
const { setPassword, createEncryptStream } = require('./aes-encrypt-stream')

let incomConn = [];
let signalSocket = [];
let dataForwarderInfo = []

app.get('/query?', (req, res) => {
    res.send('SUCCESS')
    incomConn[req.ip] = req._parsedUrl.query;
})


httpserver.listen(5555, '0.0.0.0');


const TCPServer = net.createServer();


TCPServer.on('connection', (socket) => {

    if (signalSocket.length > 0) {
        if (incomConn[socket.remoteAddress]) {
            let key = incomConn[socket.remoteAddress];
            let hashKey = key = crypto.scryptSync(key, 'XT', 32);

            for (let sock of signalSocket) {
                sock.write(`key:${incomConn[socket.remoteAddress]}`)
                sock.on('data', (buffer) => {
                    const buffferToString = buffer.toString();
                    if (buffferToString === 'invalidKey') {
                        console.log(socket.destroyed, buffferToString)
                        if (!socket.destroyed) {
                            socket.destroy()
                            console.log(socket.destroyed, buffferToString)
                        }
                    }
                })

                socket.on('close', () => {
                    sock.destroy();
                })

            }
            for (let sock of dataForwarderInfo) {

                const connectToSub = net.createConnection({
                    host: sock.host,
                    port: sock.port
                })
console.log('connectToSub.remoteAddress')
                setPassword(hashKey)

                createEncryptStream(socket).pipe(connectToSub)

            }



        }



    }


    socket.on('data', (buffer) => {
        buffferToString = buffer.toString('utf8')
        if (buffferToString.includes('SUB:')) {
            signalSocket.push(socket);
            dataForwarderInfo.push({
                host: socket.remoteAddress,
                port: buffferToString.split('SUB:')[1]
            })
            console.log(dataForwarderInfo)
        }
    })


})



TCPServer.listen(config.TCP_port, '0.0.0.0', () => {
    console.log('server is running')
})