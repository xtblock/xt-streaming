const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');
const path = require('path');
const config = require(path.join(__dirname,'../settings/config'));
const savePath = path.join(__dirname, `../${config.output_path}`);
if (isMainThread) {
  const videoData = {
    width: ['1920',  '842', '426'],
    height: ['1080' , '480',  '240'],
    videoBitRate: ['5000k', '1400k', '240k'],
    maxRate: ['5350k',  '1498k',  '240k'],
    BufSize: ['7500k',  '2100k',  '480k'],
    audioBitRate: ['192k',  '128k',  '64k'],
    fileName: ['1080p',  '480p',  '240p']
  };

  videoData.width.forEach(async function (data, index) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          width: data,
          height: videoData.height[index],
          videoBitRate: videoData.videoBitRate[index],
          maxRate: videoData.maxRate[index],
          BufSize: videoData.BufSize[index],
          audioBitRate: videoData.audioBitRate[index],
          fileName: videoData.fileName[index]
        },
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  });
  console.log("Video Encoding has been Started")
} else {
  var spawn = require('child_process').spawn;
  const inputData = workerData;
  var cmd = 'ffmpeg';
  var args = [
    '-hide_banner',
    '-threads','1',
    '-i', 'tcp://localhost:8000',// config.tcp_address,
    '-vf', `scale=w=${inputData.width}:h=${inputData.height}`,
    '-c:a', 'aac', '-ar', '48000', '-b:a', `${inputData.audioBitRate}`,
    '-profile:v', 'main',
    '-hls_time', '10',
    '-crf', '20',
    '-g', '48', '-keyint_min', '48',
    '-sc_threshold', '0',
    '-b:v', `${inputData.videoBitRate}`, '-maxrate', `${inputData.maxRate}`, '-bufsize', `${inputData.BufSize}`,
    '-hls_segment_filename', `${savePath}/${inputData.fileName}%03d.ts`,
    `${savePath}/${inputData.fileName}.m3u8`,
  ];
  var proc = spawn(cmd, args);
  proc.stdout.on('data', function (data) {
    console.log(data);
  });
  proc.stderr.setEncoding('utf8');
  proc.stderr.on('data', function (data) {
    console.log(data);
  });
  proc.on('close', function () {
    console.log('finished');
  });

}
