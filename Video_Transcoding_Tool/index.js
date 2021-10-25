const express = require("express");
const cors = require("cors");
const app = express();
const port = 8085;
app.use(cors());

const path = require("path");
const fs = require("fs");
const config = require(path.join(__dirname, "./settings/config"));
const savePath = `/home/node/media`;
app.get("/media/:quality", (req, res) => {
  res.sendFile(`/home/node/media/${req.params.quality}`); //('/home/node/media/master.m3u8')
  // res.json("im here")
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  const dir = "./media";
});
console.log("Video Encoding has been Started");

start();
function start() {
  console.log('started');
  var spawn = require("child_process").spawn;
  args = [
    "-timeout","1000000",
    "-re",
    "-i",
    config.tcp_address,
    "-y",
    "-filter_complex",
    "[0:v]split=3[v1][v2][v3];[v1]copy[v1out];[v2]scale=w=852:h=480[v2out];[v3]scale=w=640:h=360[v3out]",
    "-map",
    "[v1out]",
    "-c:v:0",
    "libx264",
    "-x264-params",
    "nal-hrd=cbr:force-cfr=1",
    "-b:v:0",
    "5M",
    "-maxrate:v:0",
    "5M",
    "-minrate:v:0",
    "5M",
    "-bufsize:v:0",
    "10M",
    "-preset",
    "veryfast",
    "-g",
    "48",
    "-sc_threshold",
    "0",
    "-keyint_min",
    "48",
    "-map",
    "[v2out]",
    "-c:v:1",
    "libx264",
    "-x264-params",
    "nal-hrd=cbr:force-cfr=1",
    "-b:v:0",
    "3M",
    "-maxrate:v:0",
    "3M",
    "-minrate:v:0",
    "3M",
    "-bufsize:v:0",
    "3M",
    "-preset",
    "veryfast",
    "-g",
    "48",
    "-sc_threshold",
    "0",
    "-keyint_min",
    "48",
    "-map",
    "[v3out]",
    "-c:v:2",
    "libx264",
    "-x264-params",
    "nal-hrd=cbr:force-cfr=1",
    "-b:v:0",
    "1M",
    "-maxrate:v:0",
    "1M",
    "-minrate:v:0",
    "1M",
    "-bufsize:v:0",
    "1M",
    "-preset",
    "veryfast",
    "-g",
    "48",
    "-sc_threshold",
    "0",
    "-keyint_min",
    "48",
    "-map",
    "a:0",
    "-c:a:0",
    "aac",
    "-b:a:0",
    "96k",
    "-ac",
    "2",
    "-map",
    "a:0",
    "-c:a:1",
    "aac",
    "-b:a:1",
    "96k",
    "-ac",
    "2",
    "-map",
    "a:0",
    "-c:a:2",
    "aac",
    "-b:a:2",
    "48k",
    "-ac",
    "2",
    "-f",
    "hls",
    "-hls_time",
    "4",
    "-hls_playlist_type",
    "event",
    "-hls_flags",
    "delete_segments",
    "-hls_segment_type",
    "mpegts",
    "-master_pl_name",
    "master.m3u8",
    "-var_stream_map",
    "v:0,a:0,name:720p v:1,a:1,name:480p v:2,a:2,name:360p",
    "/home/node/media/%v.m3u8",
  ];
  try {
    var proc = spawn(`ffmpeg`, args);
    proc.stdout.on("data", function (data) {
      console.log(data);
    });
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", function (data) {
      console.log(data);
    });
    proc.on("close", function () {
      console.log("finished");
      start();
    });
  } catch (e) {
    console.log('node error', e);
    start();
  }
  
}
