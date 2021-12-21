import React from 'react';
import './Divider.css';
function Divider(props) {
  const title = props.title;
  const recent = props.recent;

  
  return (
    <div className='row my-5 Sub-tittle_default'>
      <div className='d-flex'>
        <div className='rect_1' />
        <div className='rect_2 '>
          <p className='title_txt'  onClick={()=>props.getLiveNonLive(true)}> {title}</p>
        </div>
        {recent && (
          <div className='rect_3' >
            <p onClick={()=>props.getLiveNonLive(false)}>videos</p>
          </div>
        )}
        <div className='rect_4' />
      </div>
    </div>
  );
}

export default Divider;
