const fs = require('fs-extra');
const IpfsPI = require('ipfs-api');
const config = require('./settings/config.json');
const ipfs = IpfsPI(config.ipfs.host, config.ipfs.port, {
      protocol: config.ipfs.protocol,
});
const filePath = config.ipfs.streamConfigPathIpfs;


const getStreamData = async () => {
      const file = await ipfs.files.read(filePath);
      let data = file.toString();
      //await fs.writeFile('./streamConfig.json', data);
      return data
};

const createTime = async (data) => {
      const oldJson = await getStreamData()
      const newJson = JSON.parse(oldJson)

      let streamsArr =
      newJson.data[
            newJson.data.findIndex(
                        (obj) => obj.channelName === data.channel,
                  )
            ].streams;
            console.log(streamsArr);

      let streamObj =
            streamsArr[
                  streamsArr.findIndex((obj) => obj.streamingName === data.name)
            ];
      streamObj.streamingName = data.name;
      streamObj.started_timeStamp = data.time;
      streamObj["live"] = data.live;
      fs.writeJSON('./streamConfig.json', newJson);
      await ipfs.files.rm(filePath);
      await ipfs.files.write(filePath, './streamConfig.json', { create: true });
      
};

const live = async (data) => {
      const oldJson = await getStreamData()
      const newJson = JSON.parse(oldJson)
      let streamsArr =
            newJson.data[
                  newJson.data.findIndex(
                        (obj) => obj.channelName === data.channel,
                  )
            ].streams;
      console.log(streamsArr);
      let streamObj =
            streamsArr[
                  streamsArr.findIndex((obj) => obj.streamingName === data.name)
            ];
      console.log(data);
      streamObj.live = data.live;
      streamObj.ended_timeStamp = data.endedtime;
      fs.writeJson('./streamConfig.json', newJson);
      await ipfs.files.rm(filePath);
      await ipfs.files.write(filePath, './streamConfig.json', { create: true });
      
};

const editStreamData =  (action, data) => {
 
     if(action ==='createTimeFrame'){
       createTime(data);
     }else{
            live(data);
     }
     
};

module.exports = { getStreamData, editStreamData };
