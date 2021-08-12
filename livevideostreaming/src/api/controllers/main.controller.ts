import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import httpService from 'services/http.service';

const fs = require('fs');

export class MainController {
  public static index = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.status(200).send('Welcome to Express Boilerplate');
    } catch (err) {
      next(err);
    }
  };

  public static videos = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.sendFile(path.join(__dirname, 'videoplayer.html'));
    } catch (err) {
      next(err);
    }
  };

  public static resource = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // cosnt path = req.params.resource+'media/try.3u8'
      // res.redirect( 'videoplayer.html'))

      res.sendFile(path.join(__dirname, `media/${req.params.resource}`));
    } catch (err) {
      next(err);
    }
  };

  public static encode =
    (io?: any) => async (req: Request, res: Response, next: NextFunction) => {
      try {
        //const filename = req.params.filename
        console.log('inside API ');
        const { execFile, exec } = require('child_process');
        const child = execFile(
          path.join(__dirname, 'encode.sh'),
          [path.join(__dirname, 'video2.mov'), path.join(__dirname, 'media')],
          (error, stdout, stderr) => {
            if (error) {
              console.log('error in encode!!', error);
              throw error;
            }
            console.log('stdout,', io);

            res
              .status(200)
              .send({ message: 'Success or in prog ', data: stdout });
          }
        );

        //res.status(200).send("in prog");
      } catch (err) {
        next(err);
      }
    };

  public static stream = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.params.key, req.params.quality);
     // await httpService.create();
      /*  const encodePath = path.join(__dirname, 'encode.sh');
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
      ); */

     const dir='../media'
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });

console.log('File Reading from file.txt ..........');

// ReadFile method is used to read the content from file.txt
fs.readFile('../master.m3u8','utf8',readingFile);

function readingFile(error,data)
{
	if(error){
		console.log(error);
	} 
		fs.writeFile('../media/master.m3u8',data,'utf8',writeFile);
	}
}

function writeFile(error){
	if(error){
		console.log(error)
	}

}


  
      console.log(__dirname);
      res.sendFile(path.join(__dirname, `../../${req.params.key}/${req.params.quality}`));
      //res.status(200).send("in prog");
    } catch (err) {
      next(err);
    }
  };
}
