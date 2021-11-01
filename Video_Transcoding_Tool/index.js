const express = require("express");
const cors = require("cors");
const app = express();
const port = 8085;
const net = require("net");
app.use(cors());
const path = require("path");
const config = require(path.join(__dirname, "./settings/config"));
const ffmpeg = require("./ffmpeg");

const {
Worker,
 isMainThread,
parentPort,
workerData,
} = require("worker_threads");

let i = 1;
const workerThread = (i) => {
return new Promise((resolve, reject) => {
 const worker = new Worker(__filename, {
  workerData: i,
});
worker.on("message", resolve);
 worker.on("error", reject);
 worker.on("exit", (code) => {
 if (code !== 0)
   reject(new Error(`worker stopped with exit code ${code}`));
});
});
};

if (isMainThread) {
app.get("/media/stream1/:quality", (req, res) => {
  res.sendFile(`/home/node/media/stream1/${req.params.quality}`); //('/home/node/media/master>
});

app.get("/media/stream2/:quality", (req, res) => {
  res.sendFile(`/home/node/media/stream2/${req.params.quality}`); //('/home/node/media/master>
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

var ffmpegClient = net.connect({ port: 8000, host: "15.206.100.115" }, () => {
  console.log(config.tcp_address);
  console.log("connected to TCP Server");
   workerThread(i);
 // ffmpeg(`stream${i}`);
});
ffmpegClient.on("data", (data) => {
  connectedClient = parseInt(data.toString());
  i++;
   //ffmpeg(`stream${workerData}`);
  //ffmpeg(`stream${i}`);
	workerThread(i);
});
 } else {
ffmpeg(`stream${workerData}`);
}
