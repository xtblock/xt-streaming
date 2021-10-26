const ffmpeg = () => {
  const path = require("path");
  const config = require(path.join(__dirname, "./settings/config"));
  var fs = require("fs");
  const segment_target_duration = 4;
  const max_bitrate_ratio = 1.07;
  const rate_monitor_buffer_ratio = 1.5;

  let source = `${config.tcp_address}`;
  let target = "/home/node/media";

  let ffmpeg = `-hide_banner -y -timeout 1000000 -re -i '${source}'`;
  let staticparams =
    "-c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type event";
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    fs.writeFile(`${target}/master.m3u8`, "", (err) => {
      if (err) throw err;
    });
    console.log(`master playlist hasbeen created`);
  } else {
    if (!fs.existsSync(`${target}/master.m3u8`))
      fs.writeFile(`${target}/master.m3u8`, "", (err) => {
        if (err) throw err;
      });
    console.log(`master playlist hasbeen created`);
  }

  let dynamicQuality = [ffmpeg];

  config.quality.forEach((element) => {
    let resolution = element.res;
    let bitrate = element.bitrate;
    let audiorate = element.audio_rate;

    let width = resolution.split("x")[0];
    let height = resolution.split("x")[1];

    let maxrate = bitrate.split("k")[0] * max_bitrate_ratio;
    let bufsize = bitrate.split("k")[0] * rate_monitor_buffer_ratio;
    let bandwidth = bitrate.split("k")[0] * 1000;
    let name = `${height}p`;

    cmd = `${staticparams} -vf scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease`;
    cmd += ` -b:v ${bitrate} -maxrate ${maxrate}k -bufsize ${bufsize}k -b:a ${audiorate}`;
    cmd += ` -hls_segment_filename ${target}/${name}_%03d.ts ${target}/${name}.m3u8`;

    dynamicQuality.push(cmd);

    fs.appendFile(
      `${target}/master.m3u8`,
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${name}.m3u8\n`,
      (err) => {
        if (err) throw err;
        console.log("The playlist were updated!");
      }
    );
  });

  let command = dynamicQuality.join(" ");
  console.log(command);
  start();
  function start() {
    var { exec } = require("child_process");
    var proc = exec(`ffmpeg ${command}`);
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
  }
};

module.exports = ffmpeg;
