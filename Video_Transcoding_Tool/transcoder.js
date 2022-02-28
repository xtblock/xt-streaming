const child_process_1 = require('child_process');
const config = require('./settings/transcoding_config.json');
const services = require('./services')
const default_renditions_1 = config.quality;
const fs_1 = require('fs-extra');
const path_1 = require('path');
const {io} = require('./express')
class Transcode {
  constructor(mediaSavePath,inputPath, outputPath,streamDetails, options) {
    this.inputPath = inputPath;
    this.streamDetails =streamDetails
    this.outputPath = path_1.join(
      mediaSavePath,
      `${outputPath.channelName}/${outputPath.streams.streamingName}`,
    );
    this.options = options || {};
  }
  async transcode() {
    await fs_1.ensureDir(this.outputPath);
    const commands = await this.buildCommands();
    // const masterPlaylist = await this.writePlaylist();

    const ls = (0, child_process_1.spawn)('ffmpeg', commands);

    let showLogs = true;
    if (this.options.showLogs == false) {
      showLogs = false;
    }
//360p_001.ts' for writing
    ls.stdout.on('data', (data) => {
      if (showLogs) {
        console.log(data.toString());
      }
    });
    ls.stderr.on('data', async(data) => {
      if (showLogs) {
      console.log(data.toString());
      }
      if(data.toString().includes(`1080p1.ts' for writing`)){
        console.log(data.toString());
        this.streamDetails.streams["live"]=true;
        this.streamDetails.streams["started_timeStamp"]= new Date().getTime()
    
  await services.updateToIpfs(this.streamDetails,'start' );

    io.emit('onStreamAdd','new stream added')

    

    // need to emit socket and update ipfs stream details
      }
    });
    ls.on('exit', (code) => {
      if (showLogs) {
     console.log(code)  
      }
      this.streamDetails.streams["live"]=false;
      this.streamDetails.streams["ended_timeStamp"]= new Date().getTime();
      services.updateToIpfs(this.streamDetails,'end' )
    });

    this.inputPath.on('data', (data) => {
      ls.stdin.write(data);
    });

    ls.on('close', () => {
  // need to endtime and update ipfs stream details
    });
    this.inputPath.on('close', () => {
      ls.stdin.end();
    });
  }

  async buildCommands() {
    let source = ['-hide_banner','-re', '-i', 'pipe:' ,'-filter_complex'];
    const renditions = default_renditions_1;
    let len = renditions.length;
    let split = '[0:v]split=';
      split += len;
      for (let i = 0; i < len; i++) {
            split += `[v${i + 1}]`;
      }

      for (let i = 0; i < len; i++) {
            let height = renditions[i].res.split('x')[1];
            let width = renditions[i].res.split('x')[0];
            split += `; [v${i + 1}]scale=w=${width}:h=${height}[v${i + 1}out]`;
      }
      let mapVideo = [];

      for (let i = 0; i < len; i++) {
            mapVideo.push(
                  '-map',
                  `[v${i + 1}out]`,
                  `-c:v:${i}`,
                  'libx264',
                  '-x264-params',
                  'nal-hrd=cbr:force-cfr=0.5',
                  `-b:v:${i}`,
                  `${renditions[i].bit_rate}`,
                  `-maxrate:v:${i}`,
                  `${renditions[i].bit_rate}`,
                  `-minrate:v:${i}`,
                  `${renditions[i].bit_rate}`,
                  `-bufsize:v:${i}`,
                  renditions[i].buff_size,
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

      for (let i = 0; i < len; i++) {
            mapAudio.push(
                  '-map',
                  'a:0',
                  `-c:a:${i}`,
                  'aac',
                  `-b:a:${i}`,
                  renditions[i].audio_rate,
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
      for (let i = 0; i < len; i++) {
            let height = renditions[i].res.split('x')[1];
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
            `${this.outputPath}/stream_%v.m3u8`,
      ];
return args;
           
}

    // for (let i = 0; i < len; i++) {
    //   const r = renditions[i];

    //   // commands = commands.concat([
    //   //   '-vf',
    //   //   `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`,
    //   //   '-c:a',
    //   //   'aac',
    //   //   '-ar',
    //   //   '48000',
    //   //   '-c:v',
    //   //   'h264',
    //   //   `-profile:v`,
    //   //   r.profile,
    //   //   '-crf',
    //   //   '20',
    //   //   '-sc_threshold',
    //   //   '0',
    //   //   '-g',
    //   //   '48',
    //   //   '-hls_time',
    //   //   r.hlsTime,
    //   //   '-hls_playlist_type',
    //   //   'event',
    //   //   '-hls_flags',
    //   //   'independent_segments',
    //   //   '-b:v',
    //   //   r.bv,
    //   //   '-maxrate',
    //   //   r.maxrate,
    //   //   '-bufsize',
    //   //   r.bufsize,
    //   //   '-b:a',
    //   //   r.ba,
    //   //   '-hls_segment_filename',
    //   //   `${this.outputPath}/${r.ts_title}_%03d.ts`,
    //   //   `${this.outputPath}/${r.height}.m3u8`,
    //   //   // '-master_pl_name',
    //   //   // 'master.m3u8'
    //   // ]);
    // }
    // return commands;
  // }
  // async writePlaylist() {
  //   let m3u8Playlist = `#EXTM3U\n#EXT-X-VERSION:3`;
  //   const renditions = default_renditions_1;
  //   let len = renditions.length;
  //   for (let i = 0; i < len; i++) {
  //     const r = renditions[i];
  //     m3u8Playlist += `\n#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace(
  //             'k',
  //             '000',
  //           )},RESOLUTION=${r.width}x${r.height}\n${r.height}.m3u8`;
  //   }
  //   const m3u8Path = `${this.outputPath}/master.m3u8`;
  //   fs_1.writeFileSync(m3u8Path, m3u8Playlist);
  //   return m3u8Path;
  // }
}
module.exports.Transcoder = Transcode;























// const child_process_1 = require('child_process');
// const config = require('./settings/transcoding_config.json');
// const services = require('./services')
// const default_renditions_1 = config.qualities;
// const fs_1 = require('fs-extra');
// const path_1 = require('path');
// const {io} = require('./express')
// class Transcode {
//   constructor(inputPath, outputPath,streamDetails, options) {
//     this.inputPath = inputPath;
//     this.streamDetails =streamDetails
//     this.outputPath = path_1.join(
//      '/home/node/',
//       `media/${outputPath.channelName}/${outputPath.streams.streamingName}`,
//     );
//     this.options = options || {};
//   }
//   async transcode() {
//     await fs_1.ensureDir(this.outputPath);
//     const commands = await this.buildCommands();
//      const masterPlaylist = await this.writePlaylist();

//     const ls = (0, child_process_1.spawn)('ffmpeg', commands);

//     let showLogs = true;
//     if (this.options.showLogs == false) {
//       showLogs = false;
//     }
// //360p_001.ts' for writing
//     ls.stdout.on('data', (data) => {
//       if (showLogs) {
//         console.log(data.toString());
//       }
//     });
//     ls.stderr.on('data', async(data) => {
//       if (showLogs) {
//       console.log(data.toString());
//       }
//       if(data.toString().includes(`1080p_005.ts' for writing`)){
//         console.log(data.toString());
//         this.streamDetails.streams["live"]=true;
//         this.streamDetails.streams["started_timeStamp"]= new Date().getTime()
    
//   const updated =  await services.updateToIpfs(this.streamDetails,'start' );
//   if(updated){
//     io.emit('onStreamAdd','new stream added')
//   }
    

//     // need to emit socket and update ipfs stream details
//       }
//     });
//     ls.on('exit', (code) => {
//       if (showLogs) {
//      console.log(code)  
//       }
//       this.streamDetails.streams["live"]=false;
//       this.streamDetails.streams["ended_timeStamp"]= new Date().getTime();
//       services.updateToIpfs(this.streamDetails,'end' )
//     });

//     this.inputPath.on('data', (data) => {
//       ls.stdin.write(data);
//     });

//     ls.on('close', () => {
//   // need to endtime and update ipfs stream details
//     });
//     this.inputPath.on('close', () => {
//       ls.stdin.end();
//     });
//   }

//   async buildCommands() {
//     let commands = ['-hide_banner', '-y','-re', '-i', 'pipe:'];
//     const renditions = default_renditions_1;
//     let len = renditions.length;
//     for (let i = 0; i < len; i++) {
//       const r = renditions[i];
//       commands = commands.concat([
//         '-vf',
//         `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`,
//         '-c:a',
//         'aac',
//         '-ar',
//         '48000',
//         '-c:v',
//         'h264',
//         `-profile:v`,
//         r.profile,
//         '-crf',
//         '20',
//         '-sc_threshold',
//         '0',
//         '-g',
//         '48',
//         '-hls_time',
//         r.hlsTime,
//         '-hls_playlist_type',
//         'event',
//         '-hls_flags',
//         'independent_segments',
//         '-b:v',
//         r.bv,
//         '-maxrate',
//         r.maxrate,
//         '-bufsize',
//         r.bufsize,
//         '-b:a',
//         r.ba,
//         '-hls_segment_filename',
//         `${this.outputPath}/${r.ts_title}_%03d.ts`,
//         `${this.outputPath}/${r.height}.m3u8`,
//         // '-master_pl_name',
//         // 'master.m3u8'
//       ]);
//     }
//     return commands;
//   }
//   async writePlaylist() {
//     let m3u8Playlist = `#EXTM3U\n#EXT-X-VERSION:3`;
//     const renditions = default_renditions_1;
//     let len = renditions.length;
//     for (let i = 0; i < len; i++) {
//       const r = renditions[i];
//       m3u8Playlist += `\n#EXT-X-STREAM-INF:BANDWIDTH=${r.bv.replace(
//               'k',
//               '000',
//             )},RESOLUTION=${r.width}x${r.height}\n${r.height}.m3u8`;
//     }
//     const m3u8Path = `${this.outputPath}/master.m3u8`;
//     fs_1.writeFileSync(m3u8Path, m3u8Playlist);
//     return m3u8Path;
//   }
// }
// module.exports.Transcoder = Transcode;
