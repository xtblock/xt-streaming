const net = require('net');
const path = require('path');
const fs = require('fs-extra');

const config = require('./settings/tcp_config.json');
const services = require('./services');



const signalTranscoder = [];
const transcoderDataForwarderSocket = {};
const mainServerSocket = [];
const subServerSocket =[];



const startServer = () => {

    const SUBServer = net.createServer().listen(config.port, '0.0.0.0', () => {
        console.log(`\nSub_TCP_Server running at port : ${config.port}`)
    })

    const connectToMain = net.createConnection({
        port: new URL(config.main_server).port,
        host: new URL(config.main_server).hostname
    }, () => {
        connectToMain.write(`SUB:${config.port}/SUB_SERVER:${config.port}`);

        console.log(`\nconnection has been established to ${new URL(config.main_server).port} `)
    })

    connectToMain.on('data', async (buffer) => {
        let bufferToString = buffer.toString();
        if (bufferToString.includes(`key:`)) {
            console.log(`\nVerifying streamKey : ${bufferToString.split(`key:`)[1]} .......`)
            for (let sub of subServerSocket){
                sub.write(buffer)
            }


            const streamKeys = await fs.readJSON(
                path.join(__dirname, './streamKeys.json'),
            )
            const isValid = streamKeys.data.find(
                (key) => key.streamkey === bufferToString.split(`key:`)[1]
            );
            if (!isValid) {
                console.log(`\n Stream key not found disconnecting ....`)
                connectToMain.write(`invalidKey`);
            } else {
                console.log(`\n Stream key found connecting to transcoding_tool ....`)
                for (let sock of signalTranscoder) {
                    sock.write(`streamKey:${isValid.streamkey}`);

                    sock.on('data', data => {
                        if (data.toString() === `invalidKey`) {
                            connectToMain.write(`invalidKey`)
                        }

                    })



                }
            }



        }
    })


    SUBServer.on('connection', (socket) => {
        if (socket.remoteAddress === new URL(config.main_server).hostname) {
            console.log(`\nConnection from Main Tcp Server`)
            mainServerSocket.push(socket);
         for (let sub of subServerSocket){
             console.log(sub.port)
             const connect = net.createConnection({
                 port : sub.port,
                 host:sub.remoteAddress
             })
             socket.pipe(connect)
         }
        }


        socket.on('data', (buffer) => {
    
            let bufferToString = buffer.toString();
            if (bufferToString === `TRANSCODING`) {
                console.log(`\nTranscoding Tool is connected Verifying Transcoding Tool .....`)
                signalTranscoder.push(socket);
                let serverInfo  = {
                    
                        server_name: config.tcp_name,
                        server_pubicKey: config.tcp_server_key
                    
                }
                transcoderDataForwarderSocket[socket.remoteAddress] = [];
                socket.write(`Server_Info=${JSON.stringify(serverInfo)}`)
                console.log(`\nSending Server details to Transcoding Tool`)
            }
            if (bufferToString === `ffmpeg`) {
                console.log(`\nData forwarding is Established for ${socket.remoteAddress}`)
                transcoderDataForwarderSocket[socket.remoteAddress].push(socket);
            }
    
            if(bufferToString.includes (`SUB_SERVER:`)){
                console.log(`\nSub_Server is connected`,bufferToString)
                socket.port =bufferToString.split('/')[1].split(`SUB_SERVER:`)[1];
                subServerSocket.push(socket);
                
            }


            if (mainServerSocket.includes(socket)) {
                let index = mainServerSocket.indexOf(socket);
                for (let sock of signalTranscoder) {
                    if (transcoderDataForwarderSocket[sock.remoteAddress][index]) {
                        transcoderDataForwarderSocket[sock.remoteAddress][index].write(buffer);
                    }

                
                }
            }

        })



        socket.on('close', () => {
            if (mainServerSocket.includes(socket)) {
                console.log(`\n Stream is stopped removing socket...`);
                socket.destroy();
                let index = mainServerSocket.indexOf(socket);
                for (sock of signalTranscoder) {
                    for (ip in transcoderDataForwarderSocket) {
                        if (transcoderDataForwarderSocket[ip][index]) {
                            transcoderDataForwarderSocket[ip][index].destroy();
                        }
                    }
                }
            }

        });
    })






}





async function start() {
    const streamKeysDownloaded = await services.ipfs();
    const interval = setInterval(() => {
        const fileExists = fs.pathExistsSync('./streamKeys.json')

        if (fileExists) {
            clearInterval(interval);
            startServer();
        }
    }, 1000)

}
start()

