const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require('worker_threads');
const path = require('path');
const savePath = path.join(__dirname, '../media');
if (isMainThread) {
  const videoSizes = ['1920x1080', '1280x720', '640x360'];
  videoSizes.forEach(async function (size) {
    console.log(`${size}`);
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          size,
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
} else {
  var spawn = require('child_process').spawn;
  const inputData = workerData;

  var cmd = 'ffmpeg';
  var args = [
    '-hide_banner',
    '-i',
    `tcp://localhost:8000`,
    '-s',
    `${inputData.size}`,
    '-codec:a',
    'aac',
    '-c:v',
    'h264',
    '-f',
    'hls',
    `${savePath}/${inputData.size}.m3u8`,
  ];
  var proc = spawn(cmd, args);
  proc.stdout.on('data', function (data) {
    console.log(data);
    worker.terminate();
  });
  proc.stderr.setEncoding('utf8');
  proc.stderr.on('data', function (data) {
    console.log(data);
  });
  proc.on('close', function () {
    console.log('finished');
  });
  parentPort.postMessage(`finished into multiple sizess`);
}
