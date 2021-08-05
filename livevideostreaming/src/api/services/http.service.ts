import Responses from 'config/responses';
import path from 'path';

class HTTPService {
  private static _singleton: boolean = true;
  private static _instance: HTTPService;

  constructor() {
    if (HTTPService._singleton) {
      throw new SyntaxError(
        'This is a singleton class. Please use UserService.instance instead!'
      );
    }
  }

  public static get instance(): HTTPService {
    if (!this._instance) {
      this._singleton = false;
      this._instance = new HTTPService();
      this._singleton = true;
    }
    return this._instance;
  }

  public create = async (): Promise<any> => {
    try {
      


    } catch (e) {
      console.log(e);
      return Responses[500](e.message);
    }
  };
}

export default HTTPService.instance;
