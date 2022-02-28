const config= require('./settings/tcp_config.json')
const { create } = require('ipfs-http-client');
const fs = require('fs-extra');
const http= require('http');

let IPFS= create({ host: new URL(config.ipfs.address).hostname, port: new URL(config.ipfs.address).port, protocol: new URL(config.ipfs.address).protocol ,
  agent:http.Agent({ keepAlive: true, maxSockets: Infinity })
  });

const ipfs = async() => {
  // async function downloadJson(cid) {
    let json ;
    for await (let file of IPFS.cat(config.ipfs.stream_key_cid)) {
       json = JSON.parse(file.toString());
      
    }
    if(json){
      fs.writeJsonSync('./streamKeys.json', json, { spaces: 2 })
      return true
    }else{
      return false;
    }
  // }
  // downloadJson(config.ipfs.stream_key_cid);

};

module.exports.ipfs = ipfs;

