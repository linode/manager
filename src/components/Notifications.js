import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { hideNotifications } from '~/actions/notifications';

// eslint-disable-next-line react/prefer-stateless-function
export class Notifications extends Component {
  render() {
    const { dispatch, open } = this.props;
    return (
      <div className={`notifications ${open ? 'open' : ''}`}>
        <div
          className="notifications-overlay"
          onClick={() => dispatch(hideNotifications())}
        />
        <div className="notifications-body">
          <header>
            <nav className="clearfix">
              <a className="btn btn-cancel" onClick={() => dispatch(hideNotifications())}>
                Hide
                <span className="fa fa-angle-right" />
              </a>
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
}

Notifications.propTypes = {
  dispatch: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

function select(state) {
  return state.notifications;
}

export default connect(select)(Notifications);
