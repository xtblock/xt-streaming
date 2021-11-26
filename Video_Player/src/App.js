import './App.css';
import config from './config.json';
import React, { useState, useEffect } from 'react';
import VideoJS from './videoPlayer/VideoJS';
import io from 'socket.io-client';
import Thumbnail from './videoThumbnail/thumbnail';
import Axios from 'axios';
import hls from 'parse-hls'

function App() {
  const [streams, setStreams] = useState([]);
  const thumbRef = React.useRef(null);
  const [url, setUrl] = useState('');
  useEffect(() => {
    document.title = "XT-STREAMING V1"
  }, [])
  
  const socket = io(config.Transcoding_Tool, {
    cors: {
      origin: '*',
    },
  });
  const streamSelection = (stream) => {
 /*    if (source == stream) {
      // setUrl(``);
      setSource('');
      return;
    } */
    setUrl(`${config.Transcoding_Tool}/media/${stream}/master.m3u8`);
    // setSource(stream);
  };
  

/* Axios.get(`${config.Transcoding_Tool}/media/stream2/master.m3u8`).then(res=>{
    //console.log(res.data)
let a= hls.parse(res.data)
let newUrl=
  `${config.Transcoding_Tool}/media/stream2/${a.streamRenditions[0].uri}`
Axios.get(newUrl).then(res=>{
let isLive= hls.parse(res.data).isLive
console.log(isLive)
})
}) */

  useEffect(() => {
    socket.once('playerLoaded', (data) => {
  if(Array.isArray(data)){
    setStreams(data);
  }
    });
  }, []);
  socket.once('onStreamAdd',(data)=>{
    setStreams([...streams,data]);
  })

  
  const videoJsOptions = {
    autoplay: true,
    controls: false,
    fluid: true,
    responsive: true,
    height: '640',
   
    // width: '900',

    plugins: {},

    sources: [
      {
        src: url,
        type: 'application/x-mpegURL',
      },
    ],
  };

  const togglePlayback = (isPlaying) => {
    console.log('thumbRef', thumbRef.current);
    // const ref = thumbRef.current && thumbRef.current.children[0];
    // console.log('ref', ref);
    thumbRef.current.togglePlayback(isPlaying);
  }

  return (
    <div>
      <div className='container'>
        <div className='row banner'>
          <div className='bg-gradient' />
          <div className='col-12 p-2 profile'>
            <div className='row' style={{ color: 'white' }}>
              <div className='col-md-1 image'>
                <img
                  height='auto'
                  width='100px'
                  src={'./assets/xt-icon.png'}
                  alt=''
                />
              </div>
              <div className='col-md-5 px-5 align-self-center text'>
                <h3>XT-STREAMING V1</h3>
                <p>
                XTblock's  <span>Decentralised Live Streaming Technology</span>
                </p>
              </div>
              <div className='col-md-6 align-self-center  buttons'>
                <div className='row justify-content-end'>
                  <div className='col-md-10'>
                    <div className='banner_btn pl-5 '>
                      <button className='btn-left px-2'>
                        VIDEOS <span>{streams.length}</span>
                      </button>
                      {/* <button className='btn-center px-2'>
                        FOLLOWERS <span>4,889,255</span>
                      </button>
                      <button className='btn-right px-2'>
                        FOLLOWING <span>12</span>
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pl-10" style={{color:'white'}}><strong className="tuned">Coming soon:</strong> Our decentralised live-streaming technology. Stay tuned for our announcement and be sure to visit this site soon!</div>
        <div className='row tittle_default my-5'>
          <div className='d-flex'>
            <div className=' rect_1' />
            <div className=' rect_2'>
              <p>NOW STREAMING</p>
            </div>
            <div className=' rect_3' />
          </div>
        </div>
        <div className='row' style={{ height: '645px' }}>
          <div id='video_container'>
            <VideoJS options={videoJsOptions} toggle = {(bool) => togglePlayback(bool)} />
          </div>
        </div>
        <div className='row my-5 Sub-tittle_default'>
          <div className='d-flex'>
            <div className='rect_1' />
            <div className='rect_2 '>
              <p> RECENT VIDEOS</p>
            </div>
            <div className='rect_3'>
              <p>VIEW MORE</p>
            </div>
            <div className='rect_4' />
          </div>
        </div>
        <div className='row ' >
       <Thumbnail ref={thumbRef}   images ={streams} changeSource={item => streamSelection(item)}/>
        </div>
      </div>
      <div className='margin100' />
      <footer>
        <div className='copyright'>
          <div className='container'>
            <p>
              ©2021{' '}
              <a
                href='http://XTBlock.io'
                target='_blank'
                style={{ color: 'white' }}
              >
                XTblock
              </a>{' '}
              | All Rights Reserved.
            </p>
            <ul className='social-media'>
              <li>
                <a
                  href='https://github.com/xtblock'
                  target='_blank'
                  className='fab fa-github'
                />
              </li>
              <li>
                <a
                  href='https://twitter.com/xtblockio'
                  target='_blank'
                  className='fab fa-twitter'
                />
              </li>
              <li>
                <a
                  href='https://youtube.com/channel/UCeu4t6j8Y6s4xhZh2hIsKrQ'
                  target='_blank'
                  className='icon-youtube'
                />
              </li>
              <li>
                <a
                  href='https://www.reddit.com/user/XTblock'
                  className='fab fa-reddit'
                  target='_blank'
                />
              </li>
              <li>
                <a
                  href='https://medium.com/@XTblock'
                  className='fab fa-medium'
                  target='_blank'
                />
              </li>
              <li>
                <a
                  href='https://fb.me/XTblock.io'
                  className='fab fa-facebook'
                  target='_blank'
                />
              </li>
              <li>
                <a
                  href='https://www.linkedin.com/company/xtblock'
                  target='_blank'
                  className='fab fa-linkedin'
                />
              </li>
              <li>
                <a
                  href='https://t.me/xtblockio'
                  className='fab fa-telegram'
                  target='_blank'
                />
              </li>
            </ul>
          </div>
        </div>
        <div className='margin40' />
      </footer>
    </div>
  );
}

export default App;
