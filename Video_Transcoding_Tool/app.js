const net = require('net');
const crypto = require('crypto');
const { PassThrough } = require('stream');
const path = require('path');
const fs = require('fs-extra');

const config = require('./settings/transcoding_config.json');
const services = require('./services');
const { Transcoder } = require('./transcoder');
const { setPassword, createDecryptStream } = require('./aes-decrypt-stream.js');

const { expressServer } = require('./express');
let mediaSavePath


const startApp =()=>{
    services.downloadTCPServerKeys().then((res) => {
        if (res) {
            expressServer(mediaSavePath);
            const connectToSubServer = net.createConnection(
                {
                    host: new URL(config.sub_server).hostname,
                    port: new URL(config.sub_server).port,
                },
                () => {
                    connectToSubServer.write(`TRANSCODING`);
                    console.log(`connected to Sub Server ${new URL(config.sub_server).hostname}:${new URL(config.sub_server).port}\n`)
                },
            );
    
            connectToSubServer.on('data', async (data) => {
                if (data.toString().includes('streamKey:')) {
                    const streamDetails = await services.getStreamConfig();
                    createConnectionToSub(
                        data.toString(),
                        streamDetails,
                        connectToSubServer,
                    );
                }
                else if (data.toString().includes('Server_Info=')) {
    
                    let message = data.toString().split('Server_Info=')[1]
                    const parsedMessage = JSON.parse(message)
                    const serverKey = await fs.readJSON(path.join(__dirname, './tcpServerKeys.json'))
    
                    const isValid = serverKey.data.find(
                        ele => {
                            if ((parsedMessage.server_name === ele.tcp_server_name) && (ele.tcp_server_key === parsedMessage.server_pubicKey)) {
                                return ele
                            }
    
                        }
                    )
    
                    if (!isValid) {
                        console.log(`${parsedMessage.server_name} is Invalid Server !\n`)
                        connectToSubServer.write('invalidKey')
                    }
                    else {
                        console.log(`${parsedMessage.server_name} is Valid Server !\n`)
                    }
    
    
                }
    
            });
    
            const createConnectionToSub = async (
                keys,
                streamDetails,
                connectToSubServer,
            ) => {
                const dataReceiver = net.createConnection(
                    {
                        host: new URL(config.sub_server).hostname,
                        port: new URL(config.sub_server).port,
                    },
                    () => {
                        dataReceiver.write(`ffmpeg`);
                    },
                );
                const key = keys.split('streamKey:')[1];
                let hashKey = Buffer.from(key,'base64');
                setPassword(hashKey);
                const streamInfo = await getStreamInfo(streamDetails, key);
            
                if (streamInfo) {
                    const inspector = new PassThrough();
                    dataReceiver.pipe(createDecryptStream(inspector));
    
                    let ffmpeg = new Transcoder(mediaSavePath,inspector, streamInfo, streamInfo, {
                        showLogs: true,
                    });
    
    
            ffmpeg.transcode();
          
                } else {
                    connectToSubServer.write('invalidKey');
                }
            };
        }
    });
}

if( process.argv[2]=== '--docker'){
     mediaSavePath = '/home/node/media/'
     startApp()
}else{
    process.stdout.write('\nDirectory path to Stream Media Files: \n');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async(data) => {
       if (data === '\n' ){
           console.log('\nPlease enter a valid directory path');
           console.log('\nExiting...');
           process.exit();
       }else{
            
             let SavePath = data.replace(/'/g, '').trim('');
                const pathIsDir = await fs.stat(SavePath);
                if(pathIsDir.isDirectory()){
                    mediaSavePath=SavePath
                    console.log('\nDirectory path set to: '+mediaSavePath);
                    startApp()
                }else{
                    console.log('\nPlease enter a valid directory path');
                    console.log('\nExiting...');
                    process.exit();
                }
       }
    })
}




const getStreamInfo = async (streamDetails, key) => {
    let streamInfo = {};
    const findStreamkey = streamDetails.data.find((e) => e.streamKey === key);
    if (findStreamkey) {
        streamInfo['channelName'] = findStreamkey.channelName;
        streamInfo['streamKey'] = findStreamkey.streamKey;
        const getStream = findStreamkey.streams.find((e) => e.live === undefined);
        if (getStream) {
            streamInfo['streams'] = getStream;
        } else {
            return false;
        }
    }
    return streamInfo;
};


