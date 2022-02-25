const net = require('net');
const express = require('express');
const crypto = require('crypto');

const app = express();
const httpserver = require('http').createServer(app)

httpserver.listen(5555, '0.0.0.0', () => {
    console.log('Express server listening on port : 5555 ');
});

const config = require('./settings/tcp_config.json');
const { setPassword, createEncryptStream } = require('./aes-encrypt-stream');
const e = require('express');

const incomConn = [];
const signalSocket = [];
const dataForwarderInfo = [];

app.get('/query?', (req, res) => {
    res.send('SUCCESS');
    incomConn[req.ip] = req._parsedUrl.query;
    process.stdout.write(
        `\nOBS Client IP  : ${req.ip}\nOBS Stream Key : ${req._parsedUrl.query}\n`
    ) 
});

const TcpServer = net.createServer().listen(config.TCP_port, '0.0.0.0', () => { console.log(`\nTCP Server is running at port ${config.TCP_port}`) });

TcpServer.on('connection', (socket) => {
    if (incomConn[socket.remoteAddress]) {
        if(signalSocket.length === 0){
         console.log(`\nNo Sub Servers found terminating OBS Connection....`)   
            socket.destroy();
            delete incomConn[socket.remoteAddress];
        }else{
            console.log(`\nconnection from obs to tcp  is valid`);
            const key = incomConn[socket.remoteAddress];
            delete incomConn[socket.remoteAddress];
            const hashkey =  Buffer.from(key,'base64');
            for (let i of signalSocket) {
                console.log('sending stream key for verification ....')
                i.write(`key:${key}`);
                i.on('data', (buffer) => {
                    const bufferToString = buffer.toString();
         
                    if (bufferToString.includes('invalidKey')) {
                        console.log('Invalid stream key ,closing connection ....');
                        if (!socket.destroy()) {
                           
                            socket.destroy();
                        }
                    }
                });
            }
            for (let i of dataForwarderInfo) {
                console.log(i)
                const connectToSub = net.createConnection({
                    host: new URL(i).hostname,
                    port: new URL(i).port
                });
    
                connectToSub.on('error', (err) => {
                    console.log(err)
                });
                setPassword(hashkey);
                console.log(`sending encrypted stream to ${new URL(i).hostname}`)
                createEncryptStream(socket).pipe(connectToSub);
                connectToSub.on('close',()=>{
                   
                })

                socket.on('close', () => {
                    connectToSub.destroy();
                })
    
            }
        }
 

    }

    socket.on('data', (buffer) => {
        const bufferToString = buffer.toString();

        if (bufferToString.includes('SUB:')) {
            console.log(`\nSub Server is connected ${socket.remoteAddress}`)
            signalSocket.push(socket);
            let url = `tcp://${socket.remoteAddress}:${bufferToString.split('/')[0].split('SUB:')[1]}/`
            dataForwarderInfo.push(url);
        }
    })
    socket.on('close', () => {
        if (signalSocket.includes(socket)) {
            console.log(`\n Sub Server ${socket.remoteAddress} has been disconnected`)
            signalSocket.splice(signalSocket.indexOf(socket), 1);
            for (let i of dataForwarderInfo) {
                if (i.includes(socket.remoteAddress)) {
                    dataForwarderInfo.splice(dataForwarderInfo.indexOf(i), 1)
                }
            }
        }
    })

})
TcpServer.on('error',(err)=>{
console.log(err)
})