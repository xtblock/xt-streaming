import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useEffect,
  useContext,
} from 'react';
import moment from 'moment';

import io from 'socket.io-client';
import config from '../../config.json';
import './Thumbnail.css';
import { Context } from "./../../Context";
const socket = io(config.Transcoding_Tool);
const playBtn = require('../../assets/Mediamodifier-Design-2.svg').default;
const pauseBtn = require('../../assets/pause-circle.svg').default;
const Thumbnail = forwardRef((props, ref) => {
  // const [playerbtnName, setPlayerbtnName] = React.useState(playBtn);
  const [streamList, setStreamList] = React.useState([]);
  const [current, setCurrent] = React.useState('');
  // const [context, setContext] = useContext(Context);
  const [source, setSource] = React.useState('');
  const getUniqueList =  (unSortedArray, key) => {
    return [
      ...new Map(unSortedArray.map((item) => [item[key], item])).values(),
    ];
  };
  const arrangeDate = async (list, connectionInfo) => {
    const unSortedArray = list;
    const uniqueArray = await getUniqueList(unSortedArray, 'name');
    const sortedArray = uniqueArray.sort(
      (a, b) => new Date(b.time) - new Date(a.time),
    );
    if ('playerLoaded' === connectionInfo) {
      setStreamList(sortedArray);
      props.changeUrl(sortedArray[0].name);
      setCurrent(sortedArray[0].name);
      // setContext(sortedArray.length)
    } else {
      setStreamList(sortedArray);
      // setContext(sortedArray.length)
    }

    console.log(sortedArray, 'sorted');
  };

  useEffect(() => {
    socket.off('playerLoaded').on('playerLoaded', (list) => {
      if (Array.isArray(list)) {
        if (!(list.length === 0)) {
          arrangeDate(list, 'playerLoaded');
        }
        console.log(list, 'unsorted');
      }
    });
  }, []);
;

  socket.off('onStreamAdd').once('onStreamAdd', (newList) => {
    arrangeDate(newList);
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
      {[...streamList].map((list) => {
        return (
          <div className='col-md-3 mb-4' key={list.name}>
            <div className='stream'>
              <div className='thumb'>
                <div className='thumbnail_img'>
                  <img
                    className='thumbnail'
                    src={
                      require(`../../assets/thumbnail-${getImage()}.jpeg`)
                        .default
                    }
                    alt=''
                  />
                  {source === list.name ? (
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
                        props.changeUrl(list.name);
                        setSource(list.name);
                        setCurrent(list.name);
                        thumb_button();
                      }}
                    />
                  )}
                </div>
              </div>
              <div className='text'>
                <h4 className='thumb_heading mt-3'>LIVE: {list.name} </h4>
                <div className='legend'>
                  <span className='time'>
                    <span>
                      <img
                        height='12px'
                        width='12px'
                        style={{ fill: 'grey' }}
                        src={
                          require('../../assets/history_black_24dp.svg').default
                        }
                        alt=''
                      />
                      {streamTime(list.time)}
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
