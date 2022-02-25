import React, { useEffect } from 'react';
import './Header.css';
// import * as getService from '../../httpService';
//import config from '../../config.json';
import * as service from '../../services';
function Header(props) {
  const [count, setCount] = React.useState(0);
  const socket = props.Socket;
  const url = props.url;
  useEffect(() => {
    socket.on('playerLoaded', (list) => {
      console.log(list, 'list');
      getCount().then((res) => {
        setCount(res);
      });
    });
  }, []);

  const getCount = async () => {
    let count = 0;
    const response = await service.getStreamData(url);
    console.log(response, 'response');
    for (let liveCount of response.data) {
      for (let stream of liveCount.streams) {
        if (stream.live === true) {
          count++;
        }
      }
    }
    console.log(count, 'live count');
    return count;
  };

  socket.on('onStreamAdd', (list) => {
    getCount();
  });

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
              XTblock's <span>Decentralised Live Streaming Technology</span>{' '}
            </p>
          </div>
          <div className='col-md-6 align-self-center  buttons'>
            <div className='row justify-content-end'>
              <div className='col-md-10'>
                <div className='banner_btn pl-5 '>
                  <button className='btn-left px-2'>
                    VIDEOS <span>{count}</span>
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
