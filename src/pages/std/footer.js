import React from 'react';
import pbs from './pbs.svg';

function Footer() {
  return (
    <div className="footer">
      <a href='https://strava.com' target='_blank' rel='noreferrer'>
      <img src={pbs} alt="Powered By Strava"/>
      </a>
    </div>
  );
}

export default Footer;
