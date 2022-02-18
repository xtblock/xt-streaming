import axios from 'axios';
import config from './config.json';

const getTranscoding = async () => {
  return await axios.get(config.transcoding_tool);
};

const getStreamData = async (url) => {
  console.log(url, 'url');
  return await (
    await axios.get(`http://${url}/transcoding`)
  ).data;
};
export { getTranscoding, getStreamData };
