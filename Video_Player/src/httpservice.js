import axios from "axios";


let _singleton = true;
let _instance;
class HttpService {
    constructor(){
        if(_singleton){
            throw new SyntaxError('This is a singleton class. Please use HttpService.instance instead!');
        }        
    }

    static get GET () { return "get"; }
  

    static get instance(){
        if (!_instance) {
            _singleton = false;
            _instance = new HttpService();
            _singleton = true;
        }
        return _instance;
    }
   
    async getVideoUrl() {
  
        try {
            const url='http://localhost:4001/media/stream'
            const response =  await (axios.get(url));
            return await response.data.media_path
        } catch (e) {
            console.log("Exception", e);
        }
    }


        }


export default HttpService;