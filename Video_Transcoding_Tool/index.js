const express = require("express");
const cors = require("cors");
const app = express();
const port = 8085;
app.use(cors());

const path = require("path");
const fs = require("fs");
const config = require(path.join(__dirname, "./settings/config"));
const savePath = `/home/node/media`;
const ffmpeg = require('./ffmpeg')
app.get("/media/:quality", (req, res) => {
  res.sendFile(`/home/node/media/${req.params.quality}`); //('/home/node/media/master.m3u8')
  // res.json("im here")
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  const dir = "../media";
});

ffmpeg();




// start()
// function start() {
//   var spawn = require("child_process").spawn;
//   args = [
// `${config.tcp_address}?listen`,"./media",redention];

//   var proc = spawn(`./create_vod_stream.sh`, args);
//   proc.stdout.on("data", function (data) {
//     console.log(data);
//   });
//   proc.stderr.setEncoding("utf8");
//   proc.stderr.on("data", function (data) {
//     console.log(data);
//   });
//   proc.on("close", function () {
//     console.log("finished");
//   //  start()
//   });
// }
