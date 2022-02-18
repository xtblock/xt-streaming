const config = require('./settings/tcp_config.json')
const services= require('./services')
const net = require('net');
const path = require('path')
const fs = require('fs-extra')
services.ipfs();
const Emitter = require('events');
const event = new Emitter()

const signalTranscoder=[];
const transcoderDataForwarderSocket ={};
const mainServerSocket =[];


const connectToMain = net.createConnection({
    port :new URL(config.main_server).port,
    host: new URL (config.main_server).hostname
},()=>{
    connectToMain.write(`SUB:${config.port}`)
})


connectToMain.on('data',async (buffer)=>{
    let bufferToString = buffer.toString();
    console.log(bufferToString)
    if(bufferToString.includes('key:')){
const streamKeys =await fs.readJSON(path.join(__dirname,'./streamKeys.json'))

const isValid = streamKeys.data.find(key => key.streamkey === bufferToString.split(`key:`)[1] )
if(!isValid){
    connectToMain.write('invalidKey')
}else{
  for (let sock of signalTranscoder){
      sock.write(`streamKey:${isValid.streamkey}`)
  }
}
    }
})


const SUBServer = net.createServer();


SUBServer.on('connection', (socket) => {
    console.log('connection',socket.remoteAddress)
    if (signalTranscoder.length > 0) {
for (sockip of signalTranscoder){
   if(sockip.remoteAddress === socket.remoteAddress){
       console.log('ff')
            transcoderDataForwarderSocket[socket.remoteAddress].push(socket)
        }else{
            mainServerSocket.push(socket)
            console.log('obs')
        }
}
     
    }


    socket.on('data', (buffer) => {
        let buffferToString = buffer.toString('utf8')
        if (buffferToString.includes('TRANSCODING')) {
            signalTranscoder.push(socket);
            transcoderDataForwarderSocket[socket.remoteAddress]=[];
            socket.write(`servername:${config.tcp_name}`)
        }else if(buffferToString.includes('SendPublicKey:')){
            // public key of tcp server from .env
            socket.write(`SendPublicKey:${config.tcp_server_key}`)
        }
    })
socket.on('data',(data)=>{
  
    if(mainServerSocket.includes(socket)){
        let index = mainServerSocket.indexOf(socket);
   console.log(data)
        for (sock of signalTranscoder ){
           for (ip in transcoderDataForwarderSocket ){
               if(  (transcoderDataForwarderSocket[ip][index]) ){
                //    event.emit('start',{obs:socket,
                // receiver:transcoderDataForwarderSocket[ip][index]})
             (transcoderDataForwarderSocket[ip][index]) .write(data)
               }
       
           }
        }
    }
})
// event.once('start',(s)=>{
// (s.obs).pipe(s.receiver)
// })
socket.on('close',()=>{
    if(mainServerSocket.includes(socket)){
        let index = mainServerSocket.indexOf(socket);
        for (sock of signalTranscoder ){
            for (ip in transcoderDataForwarderSocket ){

            transcoderDataForwarderSocket[ip][index].destroy()
            }
         }

    }


})

})



SUBServer.listen(config.port, '0.0.0.0', () => {
    console.log('server is running')
})


















// const net = require('net');

// const client = net.createConnection({
//     port:8000,
//     host:'127.0.0.1'
// },()=>{
//     client.write(`SUB:9000`)
// })


// client.on('data',d=>{
// let data = d.toString();
// console.log(data)
// if(d.includes('key:')){
//     client.write('ok')
// }
// })


// const server = net.createServer((s)=>{
// s.once('data',d=>{
//     // console.log(d.toString())
// })

// }).listen(9000,'0.0.0.0')