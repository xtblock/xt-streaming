
import './App.css';
import VideoJS from './VideoJS'
import axios from'axios'
import React, { useState, useEffect } from 'react';
import HttpService from './httpservice';
function App() {

const [source,setSource]=useState(null)
  HttpService.instance.getVideoUrl().then(response=>{
    setSource(response)
  })
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
      src: source,
      type: 'application/x-mpegURL'
    },
 
  
  ]
  }
  
  return (
    <>
      <h1>Welcome To XT Streaming</h1>
      
      <VideoJS options={videoJsOptions}/>
      
    </>
  );
}

export default App;

