import React, { forwardRef, useImperativeHandle } from 'react';
import './Thumbnail.css';
import * as service from '../../services';
import moment from 'moment';
const playBtn = require('../../assets/Mediamodifier-Design-2.svg').default;
const pauseBtn = require('../../assets/pause-circle.svg').default;
const Thumbnail = forwardRef((props, ref) => {
  const [current, setCurrent] = React.useState('');
  const [source, setSource] = React.useState('');
  const [showLiveThumbnail, setShowLiveThumbnail] = React.useState(true);
  const [show, setShow] = React.useState(true);
  const [liveArr, setLiveArr] = React.useState([]);
  const [nonliveArr, setNonLiveArr] = React.useState([]);
  const [http, sethttp] = React.useState('');
  const [thumbnail_player_btn, setThumbnail_player_btn] =
    React.useState(playBtn);
  const socket = props.socket;
  

  React.useLayoutEffect(() => {
    socket.on('playerLoaded', (list) => {
      service.getStreamData(props.playerUrl).then((res) => {
        let offline = [];
        let live = []
        for (let data of res.data) {
          for (let stream of data.streams) {
            if (stream.live === true) {
            
              const newData = {
                channelName: data.channelName,
                streams: stream,
              };
              live.push(newData);
              let uniq = [...new Set(live)];
              setLiveArr(uniq);
              console.log(live, 'arr');
            }
            if (stream.live === false) {
           
              const newData = {
                channelName: data.channelName,
                streams: stream,
              };
              offline.push(newData);
              let uniq = [...new Set(offline)];
              setNonLiveArr(uniq);

            }
          }
        }
      });
    });
  }, []);

  // const live = async () => {
  //   // const json = await getService.getJson();
  //   // const parsedJson = json;

  //   let liveVideos = [];
  //   for (const live of parsedJson.data) {
  //     for (let stream of live.streams) {
  //       console.log(stream);
  //     }
  //     // const channelName = live.channelName;
  //     // const lives = live.streams.find((obj) => obj.live === true);
  //     // if (lives !== undefined) {
  //     //   lives['channelName'] = channelName;
  //     //   liveVideos.push(lives);
  //     // }
  //   }
  //   let uniq = [...new Set(liveVideos)];
  //   setLiveArr(uniq);
  //   console.log(uniq, 'live videos');
  // };

  // const nonlive = async () => {
  //   console.log('nolive');
  //   const json = await getService.getJson();
  //   const parsedJson = json;
  //   let nonLiveVideos = [];
  //   for (const live of parsedJson.data) {
  //     const channelName = live.channelName;
  //     const nonLives = live.streams.find((obj) => obj.live === false);
  //     if (nonLives !== undefined) {
  //       nonLives['channelName'] = channelName;
  //       nonLiveVideos.push(nonLives);
  //     }
  //   }
  //   let uniq = [...new Set(nonLiveVideos)];
  //   setNonLiveArr(uniq);
  //   console.log(uniq, 'no live videos');
  // };

  // socket.on('playerLoaded', (list) => {
  //   live();
  //   nonlive();
  // });

  socket.off('onStreamAdd').once('onStreamAdd', (list) => {
    service.getStreamData(props.playerUrl).then((res) => {
      let live = [];
      for (let data of res.data) {
        for (let stream of data.streams) {
          if (stream.live === true) {
        
            const newData = {
              channelName: data.channelName,
              streams: stream,
            };
            live.push(newData);
            let uniq = [...new Set(live)];
            setLiveArr(uniq);
            console.log(live, 'arr');
          }
          // if (stream.live === false) {
          //   let offline = new Set();
          //   const newData = {
          //     channelName: data.channelName,
          //     streams: stream,
          //   };
          //   offline.add(newData);
          //   setNonLiveArr(Array.from(offline));
          //   console.log(offline, 'arr');
          // }
        }
      }
    });
  });

  const thumb_button = () => {
    console.log('thumb_button');
    var myPlayer = document
      .getElementById('video_player')
      .getElementsByTagName('video')[0];
    if (myPlayer.paused) {
      myPlayer.play();
    } else {
      myPlayer.pause();
    }
  };
  const thumbnailLiveHandler = () => {
    setShowLiveThumbnail(true);
    setShow(true);
  };
  const thumbnailNoLiveHandler = () => {
    setShowLiveThumbnail(false);
    setShow(false);
  };
  const streamTime = (time) => {
    let m2 = moment(time).fromNow();
    return m2;
  };
  const playBtnClick = () => {};

  useImperativeHandle(ref, () => ({
    togglePlayback(isPlaying) {
      if (isPlaying) {
        console.log('current', current);
        setSource(current);
      } else {
        setThumbnail_player_btn(pauseBtn);
        setSource('');
      }
    },
  }));

  return (
    <div>
      <div className='row my-5 Sub-tittle_default'>
        <div className='d-flex'>
          <div className='rect_1' />
          <div className='rect_2 '>
            <p className='title_txt  cursor_1' onClick={thumbnailLiveHandler}>
              Live Videos
            </p>
          </div>

          <div className='rect_3'>
            <p className='cursor_2' onClick={thumbnailNoLiveHandler}>
              videos
            </p>
          </div>

          <div className='rect_4' />
        </div>
      </div>
      <div>
        {show ? (
          <div className='row'>
            {!(liveArr.length > 0 && showLiveThumbnail === true) ? (
              <h1
                style={{
                  color: 'white',
                  textAlign: 'center',
                  opacity: '0.5',
                  padding: '5%',
                }}
              >
                No Live Streams Found
              </h1>
            ) : (
              [...liveArr].map((list) => {
                return (
                  <div
                    className='col-md-3 mb-4'
                    key={list.streams.streamingName}
                  >
                    <div className='stream'>
                      <div className='thumb'>
                        <div className='thumbnail_img'>
                          <img
                            className='thumbnail'
                            src={list.streams.photo_thumbnail}
                            alt=''
                          />
                          {source ===
                          `${list.channelName}/${list.streams.streamingName}` ? (
                            <img
                              className={`thumbnail_btn pause`}
                              src={pauseBtn}
                              alt=''
                              onClick={() => {
                                thumb_button();
                                setSource('');
                              }}
                            />
                          ) : (
                            <img
                              className={`thumbnail_btn play`}
                              src={playBtn}
                              alt=''
                              onClick={() => {
                                props.changeUrl(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                  http,
                                );
                                setSource(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                );
                                setCurrent(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                );
                                thumb_button();
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className='text'>
                        <h4 className='thumb_heading mt-3'>
                          {list.channelName} : {list.streams.streamingName}
                        </h4>
                        <div className='legend'>
                          <span className='time'>
                            <span>
                              <img
                                height='12px'
                                width='12px'
                                style={{
                                  fill: 'grey',
                                }}
                                src={
                                  require('../../assets/history_black_24dp.svg')
                                    .default
                                }
                                alt=''
                              />{' '}
                              {streamTime(list.streams.started_timeStamp)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className='row'>
            {!(nonliveArr.length > 0 && showLiveThumbnail === false) ? (
              <h1
                style={{
                  color: 'white',
                  textAlign: 'center',
                  opacity: '0.5',
                  padding: '5%',
                }}
              >
                No Videos Found
              </h1>
            ) : (
              [...nonliveArr].map((list) => {
                return (
                  <div
                    className='col-md-3 mb-4'
                    key={list.streams.streamingName}
                  >
                    <div className='stream'>
                      <div className='thumb'>
                        <div className='thumbnail_img'>
                          <img
                            className='thumbnail'
                            src={list.streams.photo_thumbnail}
                            alt=''
                          />
                          {source ===
                          `${list.channelName}/${list.streams.streamingName}` ? (
                            <img
                              className={`thumbnail_btn pause`}
                              src={pauseBtn}
                              alt=''
                              onClick={() => {
                                thumb_button();
                                setSource('');
                              }}
                            />
                          ) : (
                            <img
                              className={`thumbnail_btn play`}
                              src={playBtn}
                              alt=''
                              onClick={() => {
                                props.changeUrl(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                  http,
                                );
                                setSource(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                );
                                setCurrent(
                                  `${list.channelName}/${list.streams.streamingName}`,
                                );
                                thumb_button();
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className='text'>
                        <h4 className='thumb_heading mt-3'>
                          {list.channelName} : {list.streams.streamingName}
                        </h4>
                        <div className='legend'>
                          <span className='time'>
                            <span>
                              <img
                                height='12px'
                                width='12px'
                                style={{
                                  fill: 'grey',
                                }}
                                src={
                                  require('../../assets/history_black_24dp.svg')
                                    .default
                                }
                                alt=''
                              />{' '}
                              {streamTime(list.streams.started_timeStamp)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default React.memo(Thumbnail);
