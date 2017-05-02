import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function SessionMenu(props) {
  const { open } = props;
  return (
    <div className={`SessionMenu ${open ? 'SessionMenu--open' : ''}`}>
      <ul className="SessionMenu-body">
        <li className="list-unstyled AccountMenu-menuItem AccountMenu-title">peaton</li>
        <hr />
        <li className="list-unstyled SessionMenu-menuItem">
          <Link to="/profile">My Profile</Link>
        </li>
        <li className="list-unstyled SessionMenu-menuItem">
          <Link to="/support">Support</Link>
        </li>
        <hr />
        <li className="list-unstyled SessionMenu-menuItem">
          <a href="https://forum.linode.com/" target="_blank" rel="nofollow noopener noreferrer">Community Forum</a>
        </li>
        <li className="list-unstyled SessionMenu-menuItem">
          <a href="https://linode.com/docs" target="_blank" rel="nofollow noopener noreferrer">User documentation</a>
        </li>
        <li className="list-unstyled SessionMenu-menuItem">
          <a href="https://developers.linode.com" target="_blank" rel="nofollow noopener noreferrer">Developer documentation</a>
        </li>
        <hr />
        <li className="list-unstyled SessionMenu-menuItem">
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
}

SessionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};
