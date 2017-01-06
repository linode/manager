import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { LinodeLogoImgSrc } from '~/assets';
import { Link } from '~/components/Link';


const navigationItems = [
  { href: '/styleguide/overview', text: 'Overview' },
  { href: '/styleguide/colors', text: 'Colors' },
  { href: '/styleguide/typography', text: 'Typography' },
  { href: '/styleguide/iconography', text: 'Iconography' },
  { href: '/styleguide/writing-style', text: 'Writing Style' },
  { href: '/styleguide/buttons', text: 'Buttons' },
  { href: '/styleguide/tabs', text: 'Tabs' },
  { href: '/styleguide/navigation', text: 'Navigation' },
  { href: '/styleguide/forms', text: 'Forms' },
  { href: '/styleguide/modals', text: 'Modals' }
];

function createNavigationItems() {
  const currentPathname = location.pathname;

  return navigationItems.map(function(item, index, arr) {
    const className = item.href === currentPathname ? 'active' : null;
    return <li><Link to={item.href} className={className}>{item.text}</Link></li>;
  });
}

export class StyleguideIndex extends Component {

  render() {
    return (
      <div className="Styleguide-container">
        <div className="Styleguide-header">
          <Link to="/" className="Styleguide-back-link"><i className="fa fa-angle-left"></i> Back to Manager</Link>
          <div className="container">
            <h1>
              <img className="LinodeLogo"
                   src={LinodeLogoImgSrc}
                   alt="Linode Logo"
              />
              Linode Style Guide
            </h1>
          </div>
        </div>
        <div className="Styleguide-main container">
          <div className="row">
            <div className="Styleguide-nav col-sm-2">
              <ul>{createNavigationItems()}</ul>
            </div>
            <div className="Styleguide-content col-sm-10">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(StyleguideIndex);
