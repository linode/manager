import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { hideSession } from '~/actions/session';
import { hideNotifications } from '~/actions/notifications';

const eventHappenedOn = (classes, e) => classes.includes(e.target.className);

class ClickCapture extends Component {
  constructor(props) {
    super(props);

    this.eventListener = this.eventListener.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.eventListener);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.eventListener);
  }

  eventListener(e) {
    const {
      sessionMenuStatus,
      hideSessionWindow,
      notificationsMenuStatus,
      hideNotificationWindow,
    } = this.props;
    if (
      notificationsMenuStatus
      && !eventHappenedOn(['MainHeader-notifications', 'fa fa-bell-o'], e)
    ) {
      hideNotificationWindow();
    } else if (
      sessionMenuStatus
      && !eventHappenedOn(['MainHeader-gravatar', 'MainHeader-username', 'MainHeader-session'], e)
    ) {
      hideSessionWindow();
    }
  }

  render() {
    return null;
  }
}

ClickCapture.propTypes = {
  sessionMenuStatus: PropTypes.bool.isRequired,
  hideSessionWindow: PropTypes.func.isRequired,
  notificationsMenuStatus: PropTypes.bool.isRequired,
  hideNotificationWindow: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  sessionMenuStatus: Boolean(state.session.open),
  notificationsMenuStatus: Boolean(state.notifications.open),
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
