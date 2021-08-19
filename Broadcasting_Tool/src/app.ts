import express, { Router } from 'express';
import bodyParser from 'body-parser'; //used to parse the form data that you pass in the request
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import AppRouter from 'config/routes';
import helmet from 'helmet';
import Bootstrap from 'config/bootstrap';
import RouterConfig from 'config/routes';
import Middleware from './config/middleware';
import * as fs from 'fs';
import * as path from 'path';
import { Socket } from 'dgram';

class App {
  public app: any;
  protected router: AppRouter;
  protected port;
  constructor() {
    this.app = express(); //run the express instance and store in app
    this.port = process.env.PORT || 4001;
    this.config(this.app);
    this.listen();
  }

  private config(app): void {
    // middlewares
    app.use(helmet());
    // support application/json type post data
    app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
    app.use(cookieParser());
    //Enables cors
    app.use(cors());
    app.use(express.static(path.join(__dirname, '../public')));
    this.configRoutes(app);
    // error handling
    this.initErrorHandling(app);
  }

  private configRoutes(app: express.Application) {
    Middleware.routes(app);
    RouterConfig.routes(app);
  }

  private initErrorHandling(app: express.Application) {
    const isProduction = process.env.NODE_ENV === 'production';

    isProduction ? app.set('env', 'production') : app.set('env', 'development');
    app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        let err: any = new Error('Not A Valid url');
        err.status = 404;
        next(err);
      }
    );
    if (app.get('env') === 'development') {
      app.use(
        (
          err: any,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          res.status(err.status || 500);
          res.json({
            message: err.message,
            error: err,
          });
        }
      );
    }

    app.use(function (
      err: any,
      req: express.Request,
      res: express.Response,
      next: Function
    ) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: {},
      });
    });
  }

  public listen() {
    const http = require('http');
    const server = http.createServer(this.app);
    const { Server } = require('socket.io');
    const io = new Server(server);

    io.on('connection', (socket) => {
      console.log('one user connected @2');
      ///////////------
      socket.on('ENCODE_INIT', (arg) => {
        console.log('Triggered encoding socket !!', arg);
        const encodePath = path.join(__dirname, 'encode.sh');
        const videoPath = `http://localhost:${this.port}`;
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
            socket.emit('ENCODE_COMPLETE', { stdout });
          }
        );
      });
      ///////////------
      //stream.pipe(fs.createWriteStream(path.join(__dirname,'video.mp4')));
    });

    server.listen(this.port, () => {
      console.log(`App listening on the http://localhost:${this.port}`);
      const dir='../media'
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });


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
    });
  }

  public initSocket = () => {
    console.log('initSockret');
    // let http = require('http').Server(this.app);
    let io = require('socket.io')(this.app.server);
    // let ss = require('socket.io-stream');
    //  var stream = ss.createStream();

    io.on('connection', function (socket) {
      console.log('one user connected');
      //ss(socket).emit('stream', stream);
      // stream.pipe(fs.createWriteStream(path.join(__dirname,'video.mp4')));
    });
  };
}

const server: App = new App();
