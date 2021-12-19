const net = require('net')
const config = require('./settings/tcpConfiguration.json')

const server = net.createServer()
const mainTcpSockets =[];
const transcodingSocket=[];



let ffmpegObj = []


server.on ('connection', (socket) => {

if(!(mainTcpSockets.includes(socket.remoteAddress))){
      ffmpegObj.push(socket)
}else{
      // mainTcpSockets.push(socket)
}

socket.on('data', (data) => {
if(data.toString().includes('address:')){
      mainTcpSockets.push(socket)
      console.log("data",data.toString().split('address:')[1])
      for(const transcodingSockets of transcodingSocket){
            transcodingSockets.write(data)
      }

}else{
      console.log(ffmpegObj.length)
            
                  ffmpegObj[0].write(data)
                    
      }

})
socket.on('close', () => {
      console.log('client disconnected')})
})
server.listen(config.ports.SubTcpMain, '0.0.0.0', () => {
      console.log('server is running on port', config.ports.SubTcpMain)
})
const server1 = net.createServer()
server1.on('connection', (socket) => {
      console.log('new connection')
     

      socket.on ('data', (data) => {
           if(data.toString().includes(":")){
            transcodingSocket.push(socket)
            
            
            
           }
            
      })
      
})

server1.listen(config.ports.SubTcpCom, '0.0.0.0',()=>{
      console.log('server is running on port', config.ports.SubTcpCom)
}
)









const client = net.createConnection(config.ports.MainCom, config.main_tcp,()=>{
      client.write(':8002')
})
client.on('data', (data) => {})