const {create } = require ('ipfs-http-client');
const config = require('./settings/transcoding_config.json')
const fs = require('fs-extra');
let IPFS= create(new URL(config.ipfs.address))

const downloadTCPServerKeys = async ( )=>{
console.log(`downloading files from IPFS ....`)
async function downloadJson (cid){
    for await(let file of IPFS.cat(cid)){
        const json = JSON.parse(file.toString())
        await fs.writeJSON('./tcpServerKeys.json', json, { spaces: 2 })
        return true
    }
}
return await downloadJson(config.ipfs.server_key_CID)
}

async function getStreamConfig(){
    for await (let file of IPFS.files.read(config.ipfs.stream_config_path)) {
        return JSON.parse(file.toString());
      }
}
async function updateToIpfs (streamdetails ,trigger) {

   for await (let file of IPFS.files.read(config.ipfs.stream_config_path)) {
       const jsonFile = JSON.parse(file.toString());

       if(trigger === "start"){
let streamInfo= jsonFile.data.find(element => element.streamKey === streamdetails.streamKey )
if(streamInfo){
let individualStream = streamInfo.streams.find(element => element.live ===undefined)
if(individualStream){
    individualStream.live =streamdetails.streams.live
    individualStream.started_timeStamp =streamdetails.streams.started_timeStamp
}

}

   }


   if(trigger === "end"){
    let streamInfo= jsonFile.data.find(element => element.streamKey === streamdetails.streamKey )
    if(streamInfo){
    let individualStream = streamInfo.streams.find(element => element.live ===true)
    if(individualStream){
        individualStream.live =streamdetails.streams.live
        individualStream.ended_timeStamp =streamdetails.streams.ended_timeStamp
    }
}
   }
await IPFS.files.write(
    config.ipfs.stream_config_path,
    Buffer.from(JSON.stringify(jsonFile, null, 2)),
    {
      create: true,
      truncate: true,
    },
  );


}
return true
}

module.exports.downloadTCPServerKeys = downloadTCPServerKeys;
module.exports.getStreamConfig = getStreamConfig;
module.exports.updateToIpfs = updateToIpfs;