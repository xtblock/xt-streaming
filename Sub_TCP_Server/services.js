const config= require('./settings/tcp_config.json')
const { create } = require('ipfs-http-client');
const fs = require('fs-extra');



const ipfs = () => {
  const IPFS = create(new URL(config.ipfs.address));
  async function downloadJson(cid) {
    for await (let file of IPFS.cat(cid)) {
      const json = JSON.parse(file.toString());
      fs.writeJSON('./streamKeys.json', json, { spaces: 2 });
    }
  }
  downloadJson(config.ipfs.stream_key_cid);
};

module.exports.ipfs = ipfs;

