import axios from "axios";
import config from './config.json'

const getData = async ()=> {
    try {
      const response = await axios.get(config.Transcoding_Tool_URL);
      console.log(response)
      return response.data.transcoding_tool

    } catch (error) {
      console.error(error);
    }
  }

const getJson = async()=>{
  try{
    const url = await getData();
   console.log(url,'url')
    const response = await axios.get(`http://${url}/streamConfig`);
    console.log(response.data);
    return  response.data
  }catch(e){
    console.log(e);
  }
}

export {getData,getJson};