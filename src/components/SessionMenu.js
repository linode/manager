import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function SessionMenu(props) {
  const { open } = props;
  return (
    <div className={`SessionMenu ${open ? 'SessionMenu--open' : ''}`}>
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
          <a href="https://forum.linode.com/" target="_blank" rel="nofollow noopener noreferrer">Community Forum</a>
        </li>
        <li className="list-unstyled SessionMenu-menu-item">
          <a href="https://linode.com/docs" target="_blank" rel="nofollow noopener noreferrer">User documentation</a>
        </li>
        <li className="list-unstyled SessionMenu-menu-item">
          <a href="https://developers.linode.com" target="_blank" rel="nofollow noopener noreferrer">Developer documentation</a>
        </li>
        <hr />
        <li className="list-unstyled SessionMenu-menu-item">
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
}

SessionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};
