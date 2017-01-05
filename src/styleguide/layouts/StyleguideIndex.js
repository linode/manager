import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Link } from '~/components/Link';


export class StyleguideIndex extends Component {

  render() {
    return (
      <div className="Styleguide-container">
        <header className="Styleguide-header">
          {/*<div className="container">*/}
          {/*<Link to="/Styleguide">*/}
          {/*<span className="MainHeader-logo fa fa-linode" />*/}
          {/*<span className="MainHeader-title">Linode</span>*/}
          {/*</Link>*/}
          {/*</div>*/}
        </header>
        <div className="Styleguide-main container">
          <h1>Styleguide</h1>
          <div className="Styleguide-content row">
            <div className="Styleguide-nav col-xs">
              <ul>
                <li><Link to="/styleguide/overview">Overview</Link></li>
                <li><Link to="/styleguide/colors">Colors</Link></li>
                <li><Link to="/styleguide/typography">Typography</Link></li>
                <li><Link to="/styleguide/iconography">Iconography</Link></li>
                <li><Link to="/styleguide/writing-style">Writing Style</Link></li>
                <li><Link to="/styleguide/buttons">Buttons</Link></li>
                <li><Link to="/styleguide/tabs">Tabs</Link></li>
                <li><Link to="/styleguide/navigation">Navigation</Link></li>
                <li><Link to="/styleguide/forms">Forms</Link></li>
                <li><Link to="/styleguide/modals">Modals</Link></li>
              </ul>
            </div>
            <div className="col-xs">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(StyleguideIndex);
