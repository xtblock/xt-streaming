import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import React, { useState, useEffect } from 'react';
import qualitySelector from 'videojs-hls-quality-selector';
import qualityLevels from 'videojs-contrib-quality-levels';
//import './VideoJs.css';
export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const { options, toggle } = props;

  
  // This seperate functional component fixes the removal of the videoelement
  // from the DOM when calling the dispose() method on a player
  const VideoHtml = (props) => (
    <div data-vjs-player>
      <video-js  id="video_player" ref={videoRef} />
     </div>
  );

  React.useEffect(() => {
    const videoElement = videoRef.current;
    let player;

    if (videoElement) {
      player = videojs(videoElement, options, () => {
        console.log('player is ready');
            player.hlsQualitySelector({
        displayCurrentQuality: true,
    });
    console.log(player.liveTracker.options_);
      });
    }
    player.on('playing', () => {
      toggle(true);
    })
    player.on('pause', () => {
      toggle(false);
    })
    return () => {
      if (player) {
        player.dispose();
      }

    };
  }, [options]);

  return <VideoHtml />;
};
export default VideoJS;
