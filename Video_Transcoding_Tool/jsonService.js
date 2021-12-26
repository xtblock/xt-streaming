const fs = require('fs-extra');
const {create,globSource} = require('ipfs-http-client');
const config = require('./settings/config.json');
const ipfs = create( `http://${config.ipfs.host}:${config.ipfs.port}`);
const filePath = config.ipfs.streamConfigPathIpfs;


const getStreamData = async () => {
  for await(const file of ipfs.files.read(filePath)){
       const json = JSON.parse(file.toString());
        fs.writeJSON('./streamVideoConfig.json', json);
      return file.toString()
};

 //await fs.writeFile('./streamConfig.json', data);
      // return data
};

const createTime = async (data) => {
      const oldJson = await getStreamData()
      console.log(oldJson);
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
     fs.writeJSON('./streamVideoConfig.json', newJson);
       await ipfs.files.rm(filePath);
     await ipfs.files.write(filePath, Buffer.from(JSON.stringify(newJson)), { create: true });
      
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
      fs.writeJson('./streamVideoConfig.json', newJson);
      await ipfs.files.rm(filePath);
     await ipfs.files.write(filePath, Buffer.from(JSON.stringify(newJson)), { create: true });
      
};

const editStreamData =  (action, data) => {
 
     if(action ==='createTimeFrame'){
       createTime(data);
     }else{
            live(data);
     }
     
};

module.exports = { getStreamData, editStreamData };
