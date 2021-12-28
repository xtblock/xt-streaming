import React, { useContext } from 'react';
import './Header.css';
import * as getService from '../../httpService';
import config from '../../config.json';
// const socket = io(config.Transcoding_Tool);

function Header(props) {
      const [count, setCount] = React.useState(0);
      const socket = props.socket;

const getCount = async () => {
  const json = await getService.getJson();
  const findLive = json.data;
  for (let streams of findLive) {
        let stream = streams.streams;
        const findLive = stream.filter(
              (stream) => stream.live === true,
        );

        if (findLive !== undefined) {
              console.log(findLive, 'findLive');
              if (findLive.length > 0) {
                    setCount(findLive.length);
                    console.log(findLive.length, 'findLive.length');
              }
        }
  }
}

      socket.on('playerLoaded',  (list) => {
         getCount()
      });

      socket.on('onStreamAdd', (list) => {
        getCount()
      });

      //   const getUniqueList = async (unSortedArray, key) => {
      //     return [
      //       ...new Map(unSortedArray.map((item) => [item[key], item])).values(),
      //     ];
      //   };

      //   React.useEffect(() => {
      //     socket.off('playerLoaded').on('playerLoaded', (list) => {

      //     });
      //   }, []);
      // ;

      //   socket.off('onStreamAdd').once('onStreamAdd', (newList) => {

      //   });
      return (
            <div className='row banner'>
                  <div className='bg-gradient' />

                  <div className='col-12 p-2 profile'>
                        <div className='row' style={{ color: 'white' }}>
                              <div className='col-md-1 image'>
                                    {/* <img height='auto' width='100px' src={'../../assets/'}/> */}
                              </div>
                              <div className='col-md-5 px-5 align-self-center text'>
                                    <h3> XT-STREAMING V1</h3>
                                    <p>
                                          XTblock's{' '}
                                          <span>
                                                Decentralised Live Streaming
                                                Technology
                                          </span>{' '}
                                    </p>
                              </div>
                              <div className='col-md-6 align-self-center  buttons'>
                                    <div className='row justify-content-end'>
                                          <div className='col-md-10'>
                                                <div className='banner_btn pl-5 '>
                                                      <button className='btn-left px-2'>
                                                            VIDEOS{' '}
                                                            <span>{count}</span>
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
      );
}

export default Header;
