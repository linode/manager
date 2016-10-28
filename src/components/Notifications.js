import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default function Notifications(props) {
  const { open, hideShowNotifications } = props;
  return (
    <div className={`notifications ${open ? 'open' : ''}`}>
      <div
        className="notifications-overlay"
        onClick={hideShowNotifications}
      />
      <div className="notifications-body">
        <header>
          <nav className="clearfix">
            <Link className="float-xs-right" to="/logout">Logout</Link>
          </nav>
        </header>
        <div>
          <h3 className="text-xs-center">No new notifications.</h3>
        </div>
      </div>
    </div>
  );
}

Notifications.propTypes = {
  open: PropTypes.bool.isRequired,
  hideShowNotifications: PropTypes.func.isRequired,
};

Notifications.defaultProps = {
  open: false,
};
