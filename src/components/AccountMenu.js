import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function AccountMenu(props) {
  const { open, company } = props;
  return (
    <div className={`AccountMenu ${open ? 'AccountMenu--open' : ''}`}>
      <ul className="AccountMenu-body">
        <li className="list-unstyled AccountMenu-menuItem AccountMenu-title">{company}</li>
        <hr />
        <li className="list-unstyled AccountMenu-menuItem">
          <Link to="/settings">Settings</Link>
        </li>
        <li className="list-unstyled AccountMenu-menuItem">
          <Link to="/billing">Billing</Link>
        </li>
        <li className="list-unstyled AccountMenu-menuItem">
          <Link to="/users">Users</Link>
        </li>
      </ul>
    </div>
  );
}

AccountMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  company: PropTypes.string.isRequired,
};
