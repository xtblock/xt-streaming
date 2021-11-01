
import './App.css';
import VideoJS from './VideoJS'

import React, { useState, useEffect } from 'react';
import HttpService from './httpservice';
function App() {

const [source,setSource]=useState('stream1');
const config = require('./config.json');
  /* HttpService.instance.getVideoUrl().then(response=>{
    setSource(response)
    console.log('source', source);
  }) */
  const streamSelection=(stream)=>{
setSource(stream)
  }
  const videoJsOptions = { // lookup the options in the docs for more options
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    plugins: {
    // qualityLevels:{},
    // hlsQualitySelector:{},
    },
    
    sources: [{
      src: `${config.Transcoding_Tool}/media/${source}/master.m3u8`,
      type: 'application/x-mpegURL'
    },
 
  
  ]
  }
  
  return (
    <>
      <h1>Welcome To XT Streaming</h1>
      <div className="videoPlayer">
      <VideoJS options={videoJsOptions}/> 
      <div className="right">
        <button className="btn" onClick={e=>streamSelection('stream1')}>Stream 1</button>
        <button className="btn" onClick={e=>streamSelection('stream2')}>Stream 2</button>
      </div>
      </div>
      
    </>
  );
}

export default App;

