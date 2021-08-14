
import './App.css';
import VideoJS from './VideoJS'

function App() {

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
      src: `http://localhost:4001/stream/media/master.m3u8`,
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
