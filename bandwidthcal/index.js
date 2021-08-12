const fs = require('fs');
const path = require('path');
const HLS = require('hls-parser');

const {MasterPlaylist, Variant} = HLS.types;
const BASE_DIR = path.join(__dirname, '../media');
const MEDIA_PLAYLIST = path.join(BASE_DIR, '240p.m3u8');
const mediaPlaylistString = fs.readFileSync(MEDIA_PLAYLIST, {encoding: 'utf8'});
const {segments} = HLS.parse(mediaPlaylistString);

const maxBitrate = segments.reduce((max, segment) => {
  const SEGMENT = path.join(BASE_DIR, segment.uri);
  const {size} = fs.statSync(SEGMENT);
  const bitrate = size * 8 / segment.duration;
  return Math.max(max, bitrate);
}, 0);

const low = new Variant({uri: '240p.m3u8', bandwidth: Math.ceil(maxBitrate)});
const masterPlaylist = new MasterPlaylist({variants: [low]});

console.log(HLS.stringify(masterPlaylist));
