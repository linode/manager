import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function SessionMenu(props) {
  const { open } = props;
  return (
    <div className={`SessionMenu ${open ? 'SessionMenu--open' : ''}`}>
      <ul className="SessionMenu-body">
        <li className="SessionMenu-item">
          <Link to="/profile">My Profile</Link>
        </li>
        <li className="SessionMenu-item">
          <Link to="/support">Support</Link>
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
          <a href="https://forum.linode.com/" target="_blank" rel="nofollow noopener noreferrer">Community Forum</a>
        </li>
        <li className="SessionMenu-item">
          <a href="https://linode.com/docs" target="_blank" rel="nofollow noopener noreferrer">User Documentation</a>
        </li>
        <li className="SessionMenu-item">
          <a href="https://developers.linode.com" target="_blank" rel="nofollow noopener noreferrer">Developer Documentation</a>
        </li>
        <hr />
        <li className="SessionMenu-item">
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
}

SessionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};
