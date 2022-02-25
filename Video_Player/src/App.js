import './App.css';
import React from 'react';
import Header from './Components/Header/Header';
import Tuned from './Components/Tuned/Tuned';
import Divider from './Components/Divider/Divider';
import Videoplayer from './Components/VideoPlayer/Videoplayer';
import Thumbnail from './Components/Thumbnail/Thumbnail';
import Footer from './Components/Footer/Footer';

function App(props) {
  const socket = props.socket;

  const playerRef = React.useRef(null);
  const thumbRef = React.useRef(null);
  const [urlId,setUrlId] = React.useState(null);

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
      playerRef.removeAttribute('muted');
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });

    console.log('player status', player);
  };
  const togglePlayback = (isPlaying) => {
    console.log('thumbref', thumbRef.current);
    thumbRef.current.togglePlayback(isPlaying);
  };
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    errorDisplay: false,
    responsive: false,
    liveui: true,
    fluid: true,
    liveTracker: { trackingThreshold: 0 },
     muted: false,
    sources: [
      {
        src: `http://${props.URL}/media/${urlId}/master.m3u8`,
        type: 'application/x-mpegURL',
      },
    ],
  };

  const changePlayerOptions = (streampath) => {
    console.log('changePlayerOptions', streampath);
    // you can update the player through the Video.js player instance
    if (!playerRef.current) {
      return;
    }
    // [update player through instance's api]
    // playerRef.current.src([
    //   {
    //     src: `http://${props.URL}/media/${streampath}/master.m3u8`,
    //     type: 'application/x-mpegURL',
    //   },
    // ]);
    // playerRef.current.autoplay(true);
    setUrlId(streampath);
  };

  return (
    <div className='App'>
      <div className='container'>
        <Header Socket={socket} url={props.URL} />

        <Tuned />
        <Divider title='NOW STREAMING' />
        <Videoplayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
          toggle={(bool) => togglePlayback(bool)}
        />
        <Thumbnail
          socket={socket}
          ref={thumbRef}
          //  showLiveThumbnail={showLive}
          playerUrl={props.URL}
          changeUrl={(url) => changePlayerOptions(url)}
        />
      </div>
      <div className='margin100' />
      <Footer />
    </div>
  );
}

export default App;
