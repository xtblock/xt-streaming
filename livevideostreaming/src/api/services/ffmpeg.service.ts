import Responses from 'config/responses';
import path from 'path';

class FFmpegService {
  private static _singleton: boolean = true;
  private static _instance: FFmpegService;

  constructor() {
    if (FFmpegService._singleton) {
      throw new SyntaxError(
        'This is a singleton class. Please use UserService.instance instead!'
      );
    }
  }

  public static get instance(): FFmpegService {
    if (!this._instance) {
      this._singleton = false;
      this._instance = new FFmpegService();
      this._singleton = true;
    }
    return this._instance;
  }

  public create = async (): Promise<any> => {
    try {
      const encodePath = path.join(__dirname, 'encode.sh');
      const videoPath = 'tcp://localhost:8000';
      const mediaPath = path.join(__dirname, 'media');
      const { execFile, exec } = require('child_process');
      const child = exec(
        `bash ${encodePath} ${videoPath} ${mediaPath}`,
        (error, stdout, stderr) => {
          if (error) {
            console.log('error in encode!!', error);
            throw error;
          }
          console.log('stdout-encode SUCCESS,');
        }
      );
    } catch (e) {
      console.log(e);
      return Responses[500](e.message);
    }
  };
}

export default FFmpegService.instance;
