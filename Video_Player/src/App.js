import './App.css';
import config from './config.json';
import React, { useState, useEffect } from 'react';
import VideoJS from './videoPlayer/VideoJS';
import io from 'socket.io-client';
function App() {
  const [streams, setStreams] = useState([]);
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');

  const socket = io(config.Transcoding_Tool, {
    cors: {
      origin: '*',
    },
  });
  const streamSelection = (stream) => {
    setUrl(`${config.Transcoding_Tool}/media/${stream}/master.m3u8`);
    setSource(stream);
  };
  let counter = 1;
  const getNumbers = () => {
    // return Math.floor(Math.random() * (3 - 1 + 1) + 1);
    
    if (counter > 3) {
      return 1;
    } else {
      return counter++;
    }
  };
  const gridAlign = (index) => {
    if (index <= 4) {
      return 'mt-4';
    }
  };
  useEffect(() => {
    socket.on('stream', (data) => {
      setStreams(data);

      console.log(data);
    });
  }, []);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
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
                <h3>XT Streaming</h3>
                <p>
                  Streaming <span>Counter-Strike: Global Offensive</span>
                </p>
              </div>
              <div className='col-md-6 align-self-center  buttons'>
                <div className='row justify-content-end'>
                  <div className='col-md-10'>
                    <div className='banner_btn pl-5 '>
                      <button className='btn-left px-2'>
                        VIDEOS <span>7,950</span>
                      </button>
                      <button className='btn-center px-2'>
                        FOLLOWERS <span>4,889,255</span>
                      </button>
                      <button className='btn-right px-2'>
                        FOLLOWING <span>12</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <VideoJS options={videoJsOptions} />
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
        <div className='row '>
          {streams.map((item) => {
            return (
              <div className='col-md-3 mb-4'>
                <div className='stream'>
                  <div
                    className='thumb'
                    onClick={(e) => {
                      streamSelection(`${item}`);
                      // setPlay(true);
                    }}
                  >
                    {item === source ? (
                      <span className='thumb_button_pause'>
                        <img
                          className='align-self-center'
                          src={require('./assets/pause-circle.svg').default}
                          alt=''
                        />
                      </span>
                    ) : (
                      <span className='thumb_button_play'>
                        <img
                          className='align-self-center'
                          src={
                            require('./assets/Mediamodifier-Design-2.svg')
                              .default
                          }
                          alt=''
                        />
                      </span>
                    )}

                    <img
                      className='thumbnail '
                      src={
                        require(`./assets/thumbnail-${getNumbers()}.jpeg`)
                          .default
                      }
                      alt=''
                    />
                  </div>
                  <div className='text'>
                    <h4 className='thumb_heading mt-3'>LIVE: {item}</h4>
                    <div className='legend'>
                      <span className='time'>
                        <span>
                          <img
                            height='12px'
                            width='12px'
                            style={{ fill: 'grey' }}
                            src={
                              require('./assets/history_black_24dp.svg').default
                            }
                            alt=''
                          />
                          8 min ago
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                XTBlock.io
              </a>{' '}
              | All Rights Reserved
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
