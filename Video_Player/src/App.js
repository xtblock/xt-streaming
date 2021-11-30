import logo from './logo.svg';
import './App.css';
import Header from './components/Header/Header';
import React, { useLayoutEffect, useEffect } from 'react';
import Tuned from './components/Tuned/Tuned';
import Divider from './components/Divider/Divider';
import Videoplayer from './components/VideoPlayer/Videoplayer';
import Footer from './components/Footer/Footer';
import Thumbnail from './components/Thumbnail/Thumbnail';
import Context from './Context';
import config from './config.json';
import io from 'socket.io-client';
const socket = io(config.Transcoding_Tool);
function App() {
  useLayoutEffect(() => {
    console.log('nder');
  });
  useLayoutEffect(() => {
    document.title = 'XT-STREAMING V1';
    console.log(config);
  }, []);

  useLayoutEffect(() => {
    socket.once('playerLoaded', (list) => {
      if (Array.isArray(list)) {
        let lastStream = list.pop();
        setUrlId(lastStream.name);
      }
    });
  }, []);
  const thumbRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const [urlId, setUrlId] = React.useState('');

  const videoJsOptions = {
    // lookup the options in the docs for more options
    autoplay: true,
    controls: true,
    errorDisplay: false,
    responsive: true,
    liveui: true,
    fluid: true,
    liveTracker: { trackingThreshold: 0 },
    sources: [
      {
        src: `${config.Transcoding_Tool}/media/${urlId}/master.m3u8`,
        type: 'application/x-mpegURL',
      },
    ],
  };
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });

    console.log('player status', player);
  };

  const changePlayerOptions = (url) => {
    console.log('changePlayerOptions', url);
    // you can update the player through the Video.js player instance
    if (!playerRef.current) {
      return;
    }
    // [update player through instance's api]
    //  playerRef.current.src([{src: `${config.Transcoding_Tool}/media/${url}/master.m3u8`, type: 'application/x-mpegURL'}]);
    // playerRef.current.autoplay(true);
    setUrlId(url);
  };
  const togglePlayback = (isPlaying) => {
    console.log('thumbref', thumbRef.current);
    thumbRef.current.togglePlayback(isPlaying);
  };

  return (
    <div className='App'>
      <div className='container'>
        <Header />
        <Tuned />
        <Divider title='NOW STREAMING' />

        <Videoplayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
          toggle={(bool) => togglePlayback(bool)}
        />
        <Divider recent={true} title='RECENT VIDEOS' />
        <Thumbnail
          ref={thumbRef}
          playerUrl={urlId}
          changeUrl={(url) => changePlayerOptions(url)}
        />
      </div>
      <div className='margin100' />
      <Footer />
    </div>
  );
}

export default App;
