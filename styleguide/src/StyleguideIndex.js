import React from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';
import StyleguideNav from './StyleguideNav';


export default function StyleguideIndex(props) {
  return (
    <div className="Styleguide-container">
      <Header className="Styleguide-header">
        <Link to="/styleguide"><h1>Styleguide</h1></Link>
      </Header>
      <div className="Styleguide-main container">
        <div className="row">
          <StyleguideNav />
          <div className="Styleguide-content col-sm-10">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
