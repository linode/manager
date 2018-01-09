import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { withRouter } from 'react-router-dom';

import { eventRead } from '~/api/ad-hoc/events';
import { createHeaderFilter, lessThanDatetimeFilter } from '~/api/util';
import api from '~/api';
import { hideNotifications, showNotifications } from '~/actions/notifications';
import { eventSeen } from '~/api/ad-hoc/events';
import NotificationList from './NotificationList';

async function markEventsSeen(dispatch, events) {
  const unseenIds = events.ids.filter(function (id) {
    return !events.events[id].seen;
  });

  // mark up to and including the most recent event seen
  if (unseenIds.length) {
    await dispatch(eventSeen(unseenIds[0]));
  }
}

class Notifications extends Component {
  state = { loading: false }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props.events, nextProps.events)
      || this.state.loading !== nextState.loading
      || this.props.menuStatus !== nextState.menuStatus;
  }

  onClickItem = async event => {
    const { dispatch } = this.props;

    if (!event.read) {
      await dispatch(eventRead(event.id));
    }
  };

  onClickShowMore = e => {
    e.stopPropagation(); // don't let the toggle close the list
    const { events } = this.props;

    const currentOldestCreatedDate = events.events[events.ids[events.ids.length - 1]].created;
    this.setState({ loading: true });
    this.fetchEventsPage(createHeaderFilter({
      seen: true,
      ...lessThanDatetimeFilter('created', currentOldestCreatedDate),
    }));
    this.setState({ loading: false });
  };

  fetchEventsPage(headers = null) {
    const { dispatch } = this.props;
    return dispatch(api.events.page(0, [], null, true, null, headers));
  }

  render() {
    const { events, unseenCount, toggleMenu, menuStatus } = this.props;

    return (
      <div
        className="MainHeader-notifications"
        onClick={() => toggleMenu(menuStatus, events)}
      >
        <i className="fa fa-bell-o" />
        {!unseenCount ? null : (
          <span className="MainHeader-badge Badge">{unseenCount}</span>
        )}
        <NotificationList
          loading={this.state.loading}
          onClickItem={this.onClickItem}
          onClickShowMore={this.onClickShowMore}
        />
      </div>
    );
  }
}

Notifications.propTypes = {
  dispatch: PropTypes.func.isRequired,
  unseenCount: PropTypes.number.isRequired,
  menuStatus: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  events: PropTypes.object, // @todo Document shape of event(s)
};

Notifications.defaultProps = {
  events: { ids: {} },
};

const mapStateToProps = (state) => ({
  unseenCount: state.notifications.open
    ? 0
    : state.api.events.ids.reduce(function (count, id) {
      return state.api.events.events[id].seen ? count : count + 1;
    }, 0),
  menuStatus: state.notifications.open,
  events: state.api.events,
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  toggleMenu: function (status, events) {
    if (status) {
      dispatch(hideNotifications());
    } else {
      markEventsSeen(dispatch, events);
      // dispatch(hideSession());
      dispatch(showNotifications());
    }
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
)(Notifications);
