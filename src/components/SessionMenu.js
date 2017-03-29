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
  );
}

SessionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};
