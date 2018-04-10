import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ExternalLink from 'linode-components/dist/buttons/ExternalLink';

import api from '~/api';
import { getEmailHash } from '~/cache';

import { ComponentPreload as Preload } from '~/decorators/Preload';

import { hideSession, showSession } from '~/actions/session';

const genGravatarURL = (email = '') => {
  return `https://gravatar.com/avatar/${getEmailHash(email)}`;
};

const Menu = ({ open }) => {
  return (
    <div className={`SessionMenu ${open ? 'SessionMenu--open' : ''}`}>
      <ul className="SessionMenu-body">
        <li className="SessionMenu-item">
          <Link to="/profile">My Profile</Link>
        </li>
        <li className="SessionMenu-item">
          <a href="mailto:feedback@linode.com">Submit Feedback</a>
        </li>
        <hr />
        <li className="SessionMenu-header">Account</li>
        <li className="SessionMenu-item">
          <Link to="/settings">Account Settings</Link>
        </li>
        <li className="SessionMenu-item">
          <Link to="/billing">Billing</Link>
        </li>
        <li className="SessionMenu-item">
          <Link to="/users">Users</Link>
        </li>
        <hr />
        <li className="SessionMenu-header">Resources</li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://www.linode.com/community">Community</ExternalLink>
        </li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://linode.com/docs">User Documentation</ExternalLink>
        </li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://developers.linode.com">Developer Documentation</ExternalLink>
        </li>
        <hr />
        <li className="SessionMenu-item">
          <Link to="/logout">Log out</Link>
        </li>
      </ul>
    </div>
  );
};

Menu.propTypes = {
  open: PropTypes.bool.isRequired,
};

class Session extends Component {
  componentDidMount() {
    document.addEventListener('click', this.onOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onOutsideClick);
  }


  onOutsideClick = (e) => {
    const { menuStatus, hideSessionWindow } = this.props;
    const classes = ['MainHeader-gravatar', 'MainHeader-username', 'MainHeader-session'];

    if (menuStatus && !classes.includes(e.target.className)) {
      hideSessionWindow();
    }
  }

  render() {
    const { username, menuStatus, toggleMenu, avatarLink } = this.props;

    if (!username) {
      return null;
    }

    return (
      <div
        className="MainHeader-session"
        onClick={() => toggleMenu(menuStatus)}
      >
        <span className="MainHeader-username">
          {username}
        </span>
        <img
          className="MainHeader-gravatar"
          src={avatarLink}
          alt="User Avatar"
          height={35}
          width={35}
        />
        <Menu open={menuStatus} />
      </div>
    );
  }
}

Session.propTypes = {
  username: PropTypes.string,
  avatarLink: PropTypes.string,
  menuStatus: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  hideSessionWindow: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  username: state.api.profile.username,
  avatarLink: genGravatarURL(state.api.profile.email),
  menuStatus: Boolean(state.session.open),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  toggleMenu: function (status) {
    if (status) {
      dispatch(hideSession());
    } else {
      dispatch(showSession());
    }
  },
  hideSessionWindow() {
    dispatch(hideSession());
  },
});

const preloadRequest = async (dispatch) => {
  await dispatch(api.profile.one());
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  Preload(preloadRequest),
)(Session);
