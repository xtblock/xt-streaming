const net = require('net');
const {expressServer} = require('./express')
const config = require('./settings/transcoding_config.json');
const crypto = require('crypto');
const { PassThrough } = require('stream');
const services = require('./services');
const { Transcoder } = require('./transcoder');
const { setPassword, createDecryptStream } = require('./aes-decrypt-stream.js');
const path = require('path');
const fs = require('fs-extra');


services.downloadTCPServerKeys().then((res) => {
  if (res) {
    expressServer()
    const connectToSubServer = net.createConnection(
      {
        host: new URL(config.sub_server).hostname,
        port: new URL(config.sub_server).port,
      },
      () => {
        connectToSubServer.write(`TRANSCODING`);
      },
    );

    connectToSubServer.on('data', async (data) => {
      if (data.toString().includes('streamKey:')) {
        const streamDetails = await services.getStreamConfig();
        createConnectionToSub(data.toString(), streamDetails);
      } else if (data.toString().includes('servername:')) {
        const streamKeys = await fs.readJSON(
          path.join(__dirname, './tcpServerKeys.json'),
        );
        const isValid = streamKeys.data.find(
          (key) =>
            key.tcp_server_name === data.toString().split(`servername:`)[1],
        );
        if (!isValid) {
          connectToSubServer.write('SendPublicKey:');
        } else {
            connectToSubServer.write('end');
        }
      } else if (data.toString().includes('SendPublicKey:')) {
        const streamKeys = await fs.readJSON(
          path.join(__dirname, './tcpServerKeys.json'),
        );
        const isValid = streamKeys.data.find(
          (key) =>
            key.tcp_server_key === data.toString().split(`SendPublicKey:`)[1],
        );
        if (isValid) {
          console.log('is valid server');
        } else {
            connectToSubServer.write('end');
        }
      }
    });

    const createConnectionToSub = async(keys, streamDetails) => {
      const dataReceiver = net.createConnection({
        host: new URL(config.sub_server).hostname,
        port: new URL(config.sub_server).port,
      });
      const key = keys.split('streamKey:')[1];
      let hashKey = crypto.scryptSync(key, 'XT', 32);
      setPassword(hashKey);
      const streamInfo = await getStreamInfo(streamDetails,key);
      const inspector = new PassThrough();
      dataReceiver.pipe(createDecryptStream(inspector));

      let ffmpeg = new Transcoder(inspector, streamInfo,streamInfo,{showLogs:true});
    
      ffmpeg.transcode();
    };
  }
});

const getStreamInfo = async (streamDetails,key) => {
let streamInfo={} ;
const findStreamkey = streamDetails.data.find(e =>e.streamKey === key);
if(findStreamkey){
   streamInfo['channelName'] = findStreamkey.channelName;
   streamInfo['streamKey'] = findStreamkey.streamKey;
   const getStream = findStreamkey.streams.find(e =>e.live === undefined);
   if(getStream){
    streamInfo['streams'] = getStream;
   } 


}
return streamInfo;

}

// const net = require('net');
// const {setPassword,createDecryptStream}= require('./aes-decrypt-stream')
// const crypto = require('crypto')
// const {PassThrough}= require('stream')
// const a = new PassThrough();
// const {Transcoder} = require('./transcoder');
// const path = require('path');
// const client = net.createConnection({
//     host:'192.168.1.6',
//     port:'9000'
// },()=>{
//     client.write(`TRANSCODING`)
// })

// client.on('data',data=>{
//     if(data.toString().includes('streamKey:')){
//         createConnectionToSub(data);
//     }
// })
// const createConnectionToSub =(data)=>{
//     const client = net.createConnection({
//         host:'192.168.1.6',
//         port : '9000'
//     })

//     const key = data.toString().split('streamKey:')[1]
//     let hashKey =crypto.scryptSync(key, 'XT', 32);
//     setPassword(hashKey)
//     client.pipe(createDecryptStream(a))

//      let b = new  Transcoder(a,path.join(__dirname,'/media'),{showLogs:true})
//      b.transcode()
// }
