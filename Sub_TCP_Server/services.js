const config= require('./settings/tcp_config.json')
const { create } = require('ipfs-http-client');
const fs = require('fs-extra');



const ipfs = async() => {
  const IPFS = create(new URL(config.ipfs.address));
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

