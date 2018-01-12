import React from 'react';
import { Route } from 'react-router-dom';
import NavigationLink from './NavigationLink';

const LinodeContextMenu = () => {
  const links = [
    { to: '/stackscripts', label: 'StackScripts', linkClass: 'ContextHeader-link' },
    { to: '/images', label: 'Images', linkClass: 'ContextHeader-link' },
    { to: '/volumes', label: 'Volumes', linkClass: 'ContextHeader-link' },
  ];

  return (
    <div className="ContextHeader">
      <div className="container">
        <div className="Menu">
          {links.map((props, key) => (
            <div className="Menu-item" key={key}>
              {React.createElement(NavigationLink, props)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default () => (
  <div>
    <Route path="/linodes" render={LinodeContextMenu} />
    <Route path="/images" component={LinodeContextMenu} />
    <Route path="/stackscripts" component={LinodeContextMenu} />
    <Route path="/volumes" component={LinodeContextMenu} />
  </div>
);
