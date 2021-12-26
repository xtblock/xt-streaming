import logo from './logo.svg';
import './App.css';
import Header from './components/Header/Header';
import React, { useLayoutEffect, useEffect } from 'react';
import Tuned from './components/Tuned/Tuned';
import Divider from './components/Divider/Divider';
import Videoplayer from './components/VideoPlayer/Videoplayer';
import Footer from './components/Footer/Footer';
import Thumbnail from './components/Thumbnail/Thumbnail';
import { Context } from "./Context.js";
import io from 'socket.io-client';
import * as getService from './httpService';
// import config from './config.json';
function App() {

  useLayoutEffect(() => {
    document.title = 'XT-STREAMING V1';
    // console.log(config);

    
  }, []);
  // const [context, setContext] = React.useState(0);
  const thumbRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const [urlId, setUrlId] = React.useState('');
  const [showLive, setshowLive] = React.useState(true);
  const [host,setHost] = React.useState('');
  // const [count,setCount] = React.useState(0);

useEffect(()=>{

  const fetch= async()=>{

    const file = await getService.getData()
    console.log(file)
    setHost(file)
  }
  fetch()

})


  const videoJsOptions = {
    // lookup the options in the docs for more options
    autoplay: true,
    controls: true,
    errorDisplay: false,
    responsive: false,
    liveui: true,
    fluid: true,
    liveTracker: { trackingThreshold: 0 },
    // muted: true,
    sources: [
      {
        src: `http://${host}/media/${urlId}/master.m3u8`,
        type: 'application/x-mpegURL',
      },
    ],
  };
  const socket = io(`http://${host}`, {
    cors: {
          orgin: '*'
    }
});

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // you can handle player events here
    player.on('waiting', () => {
      console.log('player is waiting');
      // playerRef.current.muted(true);
    });

    player.on('dispose', () => {
      console.log('player will dispose');
    });

    console.log('player status', player);
  };
const changeThumbnails=(val)=>{
  // setshowLive(val) 
}
  const changePlayerOptions = (url,host) => {
    console.log('changePlayerOptions', url);
    // you can update the player through the Video.js player instance
    if (!playerRef.current) {
      return;
    }
    // [update player through instance's api]
    //  playerRef.current.src([{src: `${config.Transcoding_Tool}/media/${url}/master.m3u8`, type: 'application/x-mpegURL'}]);
     playerRef.current.autoplay(true);
     setUrlId(url);
     setHost(host);
  };
  const togglePlayback = (isPlaying) => {
    console.log('thumbref', thumbRef.current);
    thumbRef.current.togglePlayback(isPlaying);
  };

  return (
    <div className='App'>
      <div className='container'>
     
        <Header  />
        <Tuned />
        <Divider title='NOW STREAMING' />

 <Videoplayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
          toggle={(bool) => togglePlayback(bool)}
        />
        <Divider recent={true} title='RECENT VIDEOS'  getLiveNonLive ={setshowLive}/>
        <Thumbnail
          socket = {socket}
          ref={thumbRef}
          showLiveThumbnail={showLive}
          playerUrl={urlId}
          changeUrl={(url) => changePlayerOptions(url,host)}
        />

      </div>
      <div className='margin100' />
      <Footer />
     
    </div>
  );
}

export default App;
