import React, {
      forwardRef,
      useImperativeHandle,
      useLayoutEffect,
      useEffect,
      useContext,
} from 'react';
import moment from 'moment';
import * as getService from '../../httpService';

import io from 'socket.io-client';
import config from '../../config.json';
import './Thumbnail.css';
import { Context } from './../../Context';
const socket = io(config.Transcoding_Tool);
const playBtn = require('../../assets/Mediamodifier-Design-2.svg').default;
const pauseBtn = require('../../assets/pause-circle.svg').default;
const Thumbnail = forwardRef((props, ref) => {
      // const [playerbtnName, setPlayerbtnName] = React.useState(playBtn);
      const [streamList, setStreamList] = React.useState([]);
      const [current, setCurrent] = React.useState('');
      // const [context, setContext] = useContext(Context);
      const [source, setSource] = React.useState('');
      // const getUniqueList = (unSortedArray, key) => {
      //       return [
      //             ...new Map(
      //                   unSortedArray.map((item) => [item[key], item]),
      //             ).values(),
      //       ];
      // };
      // const arrangeDate = async (list, connectionInfo) => {
      //       const unSortedArray = list;
      //       const uniqueArray = await getUniqueList(unSortedArray, 'name');
      //       const sortedArray = uniqueArray.sort(
      //             (a, b) => new Date(b.time) - new Date(a.time),
      //       );
      //       if ('playerLoaded' === connectionInfo) {
      //             setStreamList(sortedArray);
      //             props.changeUrl(sortedArray[0].name);
      //             setCurrent(sortedArray[0].name);
      //             // setContext(sortedArray.length)
      //       } else {
      //             setStreamList(sortedArray);
      //             // setContext(sortedArray.length)
      //       }

      //       console.log(sortedArray, 'sorted');
      // };

      const [liveArr, setLiveArr] = React.useState([]);
      const [nonliveArr, setNonLiveArr] = React.useState([]);
      const [http,sethttp]=React.useState('');

      console.log(props.showLiveThumbnail, 'showLive');

      const live = async () => {

            const host = await getService.getData();
            const response = await getService.getJson();
           
            const json = JSON.parse(response);

              console.log(json);
            json.data.forEach((e) => {
                  const liveStream = e.streams.find((obj) => obj.live === true);

                  if (liveStream) {
                        const NewList = liveStream;
                        NewList.channelName = e.channelName;

                        const newList = [...liveArr];
                        // newList.channelName=(e.channelName);
                        newList.push(NewList);
                        setLiveArr(newList);
                        sethttp(host);
                        console.log(newList);
                  }
            });
            console.log(liveArr);
      };
      const nonlive = async () => {
            const response = await getService.getJson();

            const json = JSON.parse(response);
             
            json.data.forEach((e) => {
                  const liveStream = e.streams.find(
                        (obj) => obj.live === false,
                  );
                  if (liveStream) {
                        const NewList = liveStream;
                        NewList.channelName = e.channelName;
                        const newList = [...nonliveArr];
                        newList.push(NewList);
                        console.log(newList);
                        setNonLiveArr(newList);
                  }
            });
            console.log(nonliveArr);
      };
      useEffect(() => {
            socket.off('playerLoaded').on('playerLoaded', (list) => {
                  live();
                  nonlive();
            });
      }, []);
      socket.off('onStreamAdd').once('onStreamAdd', (newList) => {
            live();
            console.log(newList, 'newStreamList');
      });

      const [thumbnail_player_btn, setThumbnail_player_btn] =
            React.useState(playBtn);

      const thumb_button = () => {
            console.log('thumb_button');
            var myPlayer = document
                  .getElementById('video_player')
                  .getElementsByTagName('video')[0];
            //   setThumbnail_player_btn(pauseBtn)

            if (myPlayer.paused) {
                  myPlayer.play();
                  //   setBtn(list)
            } else {
                  myPlayer.pause();
                  //   setBtn(list)
            }
      };

      const streamTime = (time) => {
            let m2 = moment(time).fromNow();
            return m2;
      };

      let counter = 1;

      console.log(props.showLiveThumbnail, 'check');

  console.log(props.showLiveThumbnail, 'showLive');


      const getImage = () => {
            if (counter > 3) {
                  counter = +1;
                  return counter;
            } else {
                  return counter++;
            }
      };

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
            <div className='row'>

                  
            

                  {(props.showLiveThumbnail === true )&&[...liveArr].map((list) => {
                        return (
                              <div
                                    className='col-md-3 mb-4'
                                    key={list.streamingName}
                              >
                                    <div className='stream'>
                                          <div className='thumb'>
                                                <div className='thumbnail_img'>
                                                      <img
                                                            className='thumbnail'
                                                            src={
                                                             list.photo_thumbnail
                                                                     
                                                            }
                                                            alt=''
                                                      />
                                                      {source ===
                                                      `${list.channelName}/${list.streamingName}` ? (
                                                            <img
                                                                  className={`thumbnail_btn pause`}
                                                                  src={pauseBtn}
                                                                  alt=''
                                                                  onClick={() => {
                                                                        thumb_button();
                                                                        setSource(
                                                                              '',
                                                                        );
                                                                  }}
                                                            />
                                                      ) : (
                                                            <img
                                                                  className={`thumbnail_btn play`}
                                                                  src={playBtn}
                                                                  alt=''
                                                                  onClick={() => {
                                                                        props.changeUrl(
                                                                              `${list.channelName}/${list.streamingName}`,http
                                                                        );
                                                                        setSource(
                                                                              `${list.channelName}/${list.streamingName}`,
                                                                        );
                                                                        setCurrent(
                                                                              `${list.channelName}/${list.streamingName}`,
                                                                        );
                                                                        thumb_button();
                                                                  }}
                                                            />
                                                      )}
                                                </div>
                                          </div>
                                          <div className='text'>
                                                <h4 className='thumb_heading mt-3'>
                                                    {list.channelName} :  {list.streamingName}
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
                                                                          require('../../assets/history_black_24dp.svg').default
                                                                                    
                                                                        }
                                                                        alt=''
                                                                  />{' '}
                                                                  {streamTime(
                                                                        list.started_timeStamp,
                                                                  )}
                                                            </span>
                                                      </span>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        );
                  })}
                   {(props.showLiveThumbnail === false )&&[...nonliveArr].map((list) => {
                        return (
                              <div
                                    className='col-md-3 mb-4'
                                    key={list.streamingName}
                              >
                                    <div className='stream'>
                                          <div className='thumb'>
                                                <div className='thumbnail_img'>
                                                      <img
                                                            className='thumbnail'
                                                            src={
                                                            list.photo_thumbnail
                                                            }
                                                            alt=''
                                                      />
                                                      {source ===
                                                      `${list.channelName}/${list.streamingName}` ? (
                                                            <img
                                                                  className={`thumbnail_btn pause`}
                                                                  src={pauseBtn}
                                                                  alt=''
                                                                  onClick={() => {
                                                                        thumb_button();
                                                                        setSource(
                                                                              '',
                                                                        );
                                                                  }}
                                                            />
                                                      ) : (
                                                            <img
                                                                  className={`thumbnail_btn play`}
                                                                  src={playBtn}
                                                                  alt=''
                                                                  onClick={() => {
                                                                        props.changeUrl(
                                                                              `${list.channelName}/${list.streamingName}`,http
                                                                        );
                                                                        setSource(
                                                                              `${list.channelName}/${list.streamingName}`,
                                                                        );
                                                                        setCurrent(
                                                                              `${list.channelName}/${list.streamingName}`,
                                                                        );
                                                                        thumb_button();
                                                                  }}
                                                            />
                                                      )}
                                                </div>
                                          </div>
                                          <div className='text'>
                                                <h4 className='thumb_heading mt-3'>
                                                {list.channelName} :  {list.streamingName}
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
                                                                          require('../../assets/history_black_24dp.svg').default
                                                                        }
                                                                        alt=''
                                                                  />{' '}
                                                                  {streamTime(
                                                                        list.started_timeStamp,
                                                                  )}
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
