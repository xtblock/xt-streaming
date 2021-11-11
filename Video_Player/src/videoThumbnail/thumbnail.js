import React, {forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import './thumbnail.css';
import VideoJS from '../videoPlayer/VideoJS';
export const Thumbnail = forwardRef((props, ref) => {
  const streams = props.images;
  const [source, setSource] = useState('');
  const [current, setCurrent] = useState('');

  const thumbnailControl = () => {
    var myPlayer = document
      .getElementById('video_player')
      .getElementsByTagName('video')[0];

    if (myPlayer.paused) {
      myPlayer.play();
    } else {
      myPlayer.pause();
    }
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

  useImperativeHandle(ref, () => ({

    togglePlayback(isPlaying) {
      if (isPlaying) {
        setSource(current);
      } else {
         setSource('');
      }
    }

  }));
  

  return (
    <div className='row'>
      { streams.map((item) => {
        return (
          <div className='col-md-3 mb-4' key={item}>
            <div className='stream'>
              <div className='thumb'>
                {item === source ? (
                  <span className='thumb_button_pause'>
                    <img
                      className='align-self-center'
                      src={require('../assets/pause-circle.svg').default}
                      alt=''
                      onClick={() => {
                        setSource('');
                        thumbnailControl();
                      }}
                    />
                  </span>
                ) : (
                  <span className='thumb_button_play'>
                    <img
                      className='align-self-center'
                      src={
                        require('../assets/Mediamodifier-Design-2.svg').default
                      }
                      alt=''
                      onClick={() => {
                        setSource(item);
                        setCurrent(item);
                        props.changeSource(item);
                        thumbnailControl();
                      }}
                    />
                  </span>
                )}

                <img
                  className='thumbnail '
                  src={
                    require(`../assets/thumbnail-${getNumbers()}.jpeg`).default
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
                          require('../assets/history_black_24dp.svg').default
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
  );
});
export default Thumbnail;
