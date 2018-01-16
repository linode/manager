import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { hideSession } from '~/actions/session';
import { hideNotifications } from '~/actions/notifications';

const ClickCapture = ({
  sessionMenuStatus,
  hideSessionWindow,
  notificationsMenuStatus,
  hideNotificationWindow,
  children,
}) => {
  return (
    <div
      onClick={(e) => {
        if (notificationsMenuStatus && !e.target.className.includes('NotificationList-listItem')) {
          hideNotificationWindow();
        } else if (sessionMenuStatus && !e.target.className.includes('SessionMenu')) {
          hideSessionWindow();
        }
      }}
    >
      {children}
    </div>
  );
};

ClickCapture.propTypes = {
  sessionMenuStatus: PropTypes.bool.isRequired,
  hideSessionWindow: PropTypes.func.isRequired,
  notificationsMenuStatus: PropTypes.bool.isRequired,
  hideNotificationWindow: PropTypes.func.isRequired,
  children: PropTypes.element,
};

const mapStateToProps = (state) => ({
  sessionMenuStatus: state.session.open,
  notificationsMenuStatus: state.notifications.open,
});

const mapDispatchToProps = (dispatch) => ({
  hideNotificationWindow() {
    dispatch(hideNotifications());
  },
  hideSessionWindow() {
    dispatch(hideSession());
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(ClickCapture);
