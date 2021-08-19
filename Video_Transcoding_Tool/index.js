const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');
const path = require('path');
const savePath = path.join(__dirname, '../media');
if (isMainThread) {
  const videoData = {
    width: ['1920', '1280', '842', '640', '426'],
    height: ['1080', '720', '480', '360', '240'],
    videoBitRate: ['5000k', '2800k', '1400k', '800k', '240k'],
    maxRate: ['5350k', '2996k', '1498k', '856k', '240k'],
    BufSize: ['7500k', '4200k', '2100k', '1200k', '480k'],
    audioBitRate: ['192k', '128k', '128k', '96k', '64k'],
    fileName: ['1080p', '720p', '480p', '360p', '240p']
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
    '-i', 'tcp://localhost:8000',
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
