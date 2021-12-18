import axios from "axios";


import config from './config.json'

const getData= async ()=> {
    try {
      const response = await axios.get(config.Transcoding_Tool);
      //  console.log(response.data);
      return response.data
    } catch (error) {
      console.error(error);
    }
  }

const getJson = async()=>{
  try{
    const response = await axios.get(config.configJson);
    //  console.log(response.data);
    return  response.data
  }catch(e){
    console.log(e);
  }
}

export {getData,getJson};