import React from 'react';

import StyleguideNav from './StyleguideNav';


export default function StyleguideIndex(props) {
  return (
    <div>
      <div className="Styleguide-container">
        <div className="Styleguide-header">
          <div className="container">
            <h1>
              Linode Style Guide
            </h1>
          </div>
        </div>
        <div className="Styleguide-main container">
          <div className="row">
            <StyleguideNav />
            <div className="Styleguide-content col-sm-10">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
