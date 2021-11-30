import React from 'react';
import './Footer.css';
function Footer() {
  return (
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
              XTblock
            </a>{' '}
            | All Rights Reserved.
          </p>
          <ul className='social-media'>
            <li>
              <a
                href='https://github.com/xtblock'
                target='_blank'
                className='a fab fa-github'
              />
            </li>
            <li>
              <a
                href='https://twitter.com/xtblockio'
                target='_blank'
                className='a fab fa-twitter'
              />
            </li>
            <li>
              <a
                href='https://youtube.com/channel/UCeu4t6j8Y6s4xhZh2hIsKrQ'
                target='_blank'
                className='a icon-youtube'
              />
            </li>
            <li>
              <a
                href='https://www.reddit.com/user/XTblock'
                className='a fab fa-reddit'
                target='_blank'
              />
            </li>
            <li>
              <a
                href='https://medium.com/@XTblock'
                className='a fab fa-medium'
                target='_blank'
              />
            </li>
            <li>
              <a
                href='https://fb.me/XTblock.io'
                className='a fab fa-facebook'
                target='_blank'
              />
            </li>
            <li>
              <a
                href='https://www.linkedin.com/company/xtblock'
                target='_blank'
                className='a fab fa-linkedin'
              />
            </li>
            <li>
              <a
                href='https://t.me/xtblockio'
                className='a fab fa-telegram'
                target='_blank'
              />
            </li>
          </ul>
        </div>
      </div>
      <div className='margin40' />
    </footer>
  );
}

export default Footer;
