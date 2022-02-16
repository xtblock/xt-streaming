const fs = require('fs-extra');
const path = require('path');
const { create, globSource } = require('ipfs-http-client');
const config = require('./settings/config.json');
const ipfs = create(`http://${config.ipfs.host}:${config.ipfs.port}`);
const filePath = config.ipfs.streamConfigPathIpfs;
const fileName = filePath.split('/')[1];
const axios = require('axios');
const { exec } = require('child_process');

let failedCount = 0;
const getStreamData = async () => {
  const response = await axios.post(
    `http://${config.ipfs.host}:${config.ipfs.port}/api/v0/files/read?arg=${filePath}`,
  );

  console.log(response.data);
  await fs.writeJSON(`./${fileName}`, response.data);
  return response.data;
};

const createTime = async (data) => {
  const oldJson = fs.readFileSync(`./${fileName}`, 'utf8');
  console.log(oldJson);
  const newJson = JSON.parse(oldJson);

  let streamsArr =
    newJson.data[
      newJson.data.findIndex((obj) => obj.channelName === data.channel)
    ].streams;
  console.log(streamsArr);

  let streamObj =
    streamsArr[streamsArr.findIndex((obj) => obj.streamingName === data.name)];
  streamObj.streamingName = data.name;
  streamObj.started_timeStamp = data.time;
  streamObj['live'] = data.live;
  await fs.writeJSON(`./${fileName}`, newJson);
  await ipfs.files.rm(filePath);
  const child = exec(
    `curl -X POST -F file=@'./${fileName}' "http://${config.ipfs.host}:${config.ipfs.port}/api/v0/files/write?arg=${filePath}&create=true"`,
  );
  child.stdout.on('data', (data, err) => {
    console.log(err);
    console.log(data);
  });

  child.stderr.on('data', (data) => {
    console.log(data.toString());
  });
  // await ipfs.files.rm(filePath);
  // await ipfs.files.write(filePath, Buffer.from(JSON.stringify(newJson)), {
  //       create: true,
  // });
};

const live = async (data) => {
  const oldJson = fs.readFileSync(`./${fileName}`, 'utf8');

  const newJson = JSON.parse(oldJson);
  let streamsArr =
    newJson.data[
      newJson.data.findIndex((obj) => obj.channelName === data.channel)
    ].streams;
  console.log(streamsArr);
  let streamObj =
    streamsArr[streamsArr.findIndex((obj) => obj.streamingName === data.name)];
  console.log(data);
  streamObj.live = data.live;
  streamObj.ended_timeStamp = data.endedtime;
  await fs.writeJson(`./${fileName}`, newJson);
  await ipfs.files.rm(filePath);
  const child = exec(
    `curl -X POST -F file=@'./${fileName}' "http://${config.ipfs.host}:${config.ipfs.port}/api/v0/files/write?arg=${filePath}&create=true"`,
  );
  child.stdout.on('data', (data, err) => {
    console.log(err);
    console.log(data);
  });

  child.stderr.on('data', (data) => {
    console.log(data.toString());
  });
  // await ipfs.files.rm(filePath);
  // await ipfs.files.write(filePath, Buffer.from(JSON.stringify(newJson)), {
  //       create: true,
  // });
};

const editStreamData = (action, data) => {
  if (action === 'createTimeFrame') {
    createTime(data);
  } else {
    live(data);
  }
};

module.exports = { getStreamData, editStreamData };
