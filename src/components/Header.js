import React, { PropTypes, Component } from 'react';

import { LinodeLogoImgSrc } from '~/assets';

import { Link } from '~/components/Link';
import { Notifications } from '~/components/notifications';

export default class Header extends Component {

  constructor(props) {
    super(props);

    this.onNotificationMenuClick = this.onNotificationMenuClick.bind(this);
    this.onSessionMenuClick = this.onSessionMenuClick.bind(this);

    this.state = { sessionMenuOpen: false };
  }

  onSessionMenuClick() {
    const { sessionMenuOpen } = this.state;

    this.setState({ sessionMenuOpen: !sessionMenuOpen });
  }

  // TODO: look at syncing up this toggle between menus via redux state
  onNotificationMenuClick(open) {
    if (open) {
      this.setState({ sessionMenuOpen: false });
    }
  }

  render() {
    const {
      dispatch,
      emailHash,
      username,
    } = this.props;

    const {
      sessionMenuOpen,
    } = this.state;

    const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;
    const { pathname } = window.location;
    const linkClass = (link, primary = 'MainHeader') =>
      `${primary}-link ${link === pathname ? `${primary}-link--selected` : ''}`;

    return (
      <div className="Header">
        <div className="MainHeader clearfix">
          <div className="container">
            <div className="MainHeader-brand">
              <Link to="/">
                <span className="MainHeader-logo">
                  <img
                    src={LinodeLogoImgSrc}
                    alt="Linode Logo"
                    height={40}
                    width={35}
                  />
                </span>
                <span className="MainHeader-title">Linode Manager</span>
              </Link>
            </div>
            <Link
              className={`${linkClass('/linodes')}`}
              to="/linodes"
            >Linodes</Link>
            <Link
              className={`${linkClass('/nodebalancers')}`}
              to="/nodebalancers"
            >NodeBalancers</Link>
            <Link
              className={`${linkClass('/dnsmanager')}`}
              to="/dnsmanager"
            >DNS Manager</Link>
            {!username ? null :
              <div
                className="MainHeader-session float-xs-right"
                onClick={this.onSessionMenuClick}
              >
                <span className="MainHeader-username">
                  {username}
                </span>
                <img
                  className="MainHeader-gravatar"
                  src={gravatarLink}
                  alt="User Avatar"
                  height={35}
                  width={35}
                />
                <div className={`SessionMenu ${sessionMenuOpen ? 'SessionMenu--open' : ''}`}>
                  <ul className="SessionMenu-body">
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/profile">My Profile</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/users">Users</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/billing">Billing</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/settings">Settings</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/support">Support</Link>
                    </li>
                    <hr />
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="https://forum.linode.com/">Community Forum</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="https://linode.com/docs">User documentation</Link>
                    </li>
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="https://developers.linode.com">Developer documentation</Link>
                    </li>
                    <hr />
                    <li className="list-unstyled SessionMenu-menu-item">
                      <Link to="/logout">Logout</Link>
                    </li>
                  </ul>
                </div>
              </div>
            }
            <div className="MainHeader-notifications float-xs-right">
              <Notifications
                dispatch={dispatch}
                onMenuClick={this.onNotificationMenuClick}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  showInfobar: PropTypes.bool.isRequired,
};

Header.defaultProps = {
  showInfobar: true,
};
