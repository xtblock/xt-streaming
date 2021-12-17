import axios from "axios";




const getData= async ()=> {
    try {
      const response = await axios.get('http://localhost:8085');
      // console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

const getJson = async()=>{
  try{
    const response = await axios.get('http://localhost:8085/streamConfig');
    // console.log(response);
    return response.data;
  }catch(e){
    console.log(e);
  }
}

export {getData,getJson};