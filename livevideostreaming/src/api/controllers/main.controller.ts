import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import ffmpegService from 'services/ffmpeg.service';
import FFmpegService from 'services/ffmpeg.service';
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
      await ffmpegService.create();
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

      //res.status(200).send("in prog");
    } catch (err) {
      next(err);
    }
  };
}
