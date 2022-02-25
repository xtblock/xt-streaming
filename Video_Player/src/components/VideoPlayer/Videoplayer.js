import React from 'react';
import videojs from 'video.js';
import './Videoplayer.css';
import 'video.js/dist/video-js.css';
import qualitySelector from 'videojs-hls-quality-selector';
import qualityLevels from 'videojs-contrib-quality-levels';
const Videoplayer = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, toggle } = props;

  React.useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      console.log(videoElement);
      if (!videoElement) return;

      const player = (playerRef.current = videojs(videoElement, options, () => {
        console.log('player is ready');
        console.log(player.hlsQualitySelector);
        player.hlsQualitySelector({ displayCurrentQuality: true });

        onReady && onReady(player);
      }));
    } else {
      // you can update player here [update player through props]
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);
  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    player.on('playing', () => {
      toggle(true);
    });
    player.on('pause', () => {
      toggle(false);
    });
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);
  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        id='video_player'
        className='video-js vjs-big-play-centered'
        oncanplay='this.muted=false'
      />
    </div>
  );
};

export default Videoplayer;
