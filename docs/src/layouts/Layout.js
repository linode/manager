import React from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';


export default function Layout(props) {
  return (
    <div className="Layout">
      <Header></Header>
      <div className="Layout-container container">
        <div className="Layout-navigationContainer">
          <div className="VerticalNav">
            <div className="VerticalNav-section">
              <h3>Getting Started</h3>
              <ul>
                <li><Link to="/introduction">Introduction</Link></li>
                <li><Link to="/authorization">Authorization</Link></li>
                <li><Link to="/pagination">Pagination</Link></li>
                <li><Link to="/filtering">Filtering</Link></li>
              </ul>
            </div>
            <div className="VerticalNav-section">
              <h3>Reference</h3>
              <ul>
                <li><Link to="/linodes">Linodes</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="Layout-content">
          {props.children}
        </div>
      </div>
    </div>
  );
};
