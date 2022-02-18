import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as service from './services';
import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client';

document.title = 'XT-STREAMING V1';
service.getTranscoding().then((res) => {
  console.log(res.data,'what')
  const URL = res.data;
  const socket = io(`http://${URL.transcoding_tool}`, {
    cors: {
      orgin: '*',
    },
  });
  ReactDOM.render(
    <React.StrictMode>
      <App URL={URL.transcoding_tool} socket={socket} />
    </React.StrictMode>,
    document.getElementById('root'),
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
