const config = require('./settings/config.json');
const spawn = require('child_process').spawn;
const fs = require('fs');

const ffmpeg = async(id) => {
  const input = config.tcp_address;
  const output = `/home/node/media/${id}`;
  if (!fs.exists(output,()=>{})) {
    fs.mkdir(output, {
      recursive: true,
    },()=>{});
  }
  const no_stream = config.quality.length;
  const source = [
    '-hide_banner',
    '-loglevel',
    'error',
    '-re',
    '-i',
    `${input}`,
    '-filter_complex',
  ];

  let split = '[0:v]split=';
  split += no_stream;
  for (i = 0; i < no_stream; i++) {
    split += `[v${i + 1}]`;
  }

  for (i = 0; i < no_stream; i++) {
    let height = config.quality[i].res.split('x')[1];
    let width = config.quality[i].res.split('x')[0];
    split += `; [v${i + 1}]scale=w=${width}:h=${height}[v${i + 1}out]`;
  }
  let mapVideo = [];

  for (i = 0; i < no_stream; i++) {
    mapVideo.push(
      '-map',
      `[v${i + 1}out]`,
      `-c:v:${i}`,
      'libx264',
      '-x264-params',
      'nal-hrd=cbr:force-cfr=0.5',
      `-b:v:${i}`,
      `${config.quality[i].bit_rate}`,
      `-maxrate:v:${i}`,
      `${config.quality[i].bit_rate}`,
      `-minrate:v:${i}`,
      `${config.quality[i].bit_rate}`,
      `-bufsize:v:${i}`,
      config.quality[i].buff_size,
      '-preset',
      'ultrafast',
      '-g',
      '48',
      '-sc_threshold',
      '0',
      '-keyint_min',
      '48',
    );
  }

  let mapAudio = [];

  for (i = 0; i < no_stream; i++) {
    mapAudio.push(
      '-map',
      'a:0',
      `-c:a:${i}`,
      'aac',
      `-b:a:${i}`,
      config.quality[i].audio_rate,
      '-ac',
      '2',
    );
  }

  let hlsFormat = [
    '-f',
    'hls',
    '-hls_time',
    '2',
    '-hls_playlist_type',
    'event',
    '-hls_flags',
    'independent_segments',
    '-hls_segment_type',
    'mpegts',
    '-master_pl_name',
    'master.m3u8',
  ];

  let varStream = '';
  for (i = 0; i < no_stream; i++) {
    let height = config.quality[i].res.split('x')[1];
    varStream += ` v:${i},a:${i},name:${height}p`;
  }

  let args = [
    ...source,
    split,
    ...mapVideo,
    ...mapAudio,
    ...hlsFormat,
    '-var_stream_map',
    varStream,
    `${output}/stream_%v.m3u8`,
  ];

  var proc = spawn(`ffmpeg`, args);
  proc.stdout.on('data', function (data,err) {
  console.log(err)
  });


  proc.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  proc.on('close', function () {
    console.log('finished')
});
};

module.exports = ffmpeg;
