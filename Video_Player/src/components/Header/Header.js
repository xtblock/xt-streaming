import React from 'react';
import './Header.css';

function Header() {
    return (
      <div className="row banner"> 
      <div className="bg-gradient"/>
  
        
    <div className='col-12 p-2 profile'>
      <div className='row' style={{color:"white"}}>
            <div className="col-md-1 image">
                {/* <img height='auto' width='100px' src={'../../assets/'}/> */}
            </div>
            <div className="col-md-5 px-5 align-self-center text">
                <h3> XT-STREAMING V1</h3>
                <p>XTblock's <span>Decentralised Live Streaming Technology</span> </p>
            </div>
            <div className='col-md-6 align-self-center  buttons'>
                <div className='row justify-content-end'>
                  <div className='col-md-10'>
                    <div className='banner_btn pl-5 '>
                      <button className='btn-left px-2'>
                        VIDEOS <span>streams.length</span>
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
     
    )
}

export default Header
