import axios from "axios";


const getData = async ()=> {
    try {
      const response = await axios.get('https://ipfs.io/ipfs/Qma5EXuQmFw1cGBaB69veMSQdatfnK5d6VD9Mrj3zMpqSX?filename=config.json');
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