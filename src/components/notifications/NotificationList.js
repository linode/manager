import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import NotificationListItem from './NotificationListItem';

export class NotificationList extends Component {
  constructor(props) {
    super(props);

    this.state = { totalResults: props.events.totalResults || 0 };
  }
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.events, nextProps.events)
      || this.props.loading !== nextProps.loading
      || this.props.open !== nextProps.open;
  }

  onClickShowMore = e => {
    e.preventDefault();
    this.props.onClickShowMore(e);
  };

  updateTotalResults(events) {
    if (events.totalResults > this.state.totalResults) {
      this.setState((prevState) => ({ ...prevState, totalResults: events.totalResults }));
    }
  }

  render() {
    const { events, loading = false, open, onClickItem } = this.props;
    const eventMap = events.events;
    const showMore = events.ids.length < this.state.totalResults;
    let message;

    if (loading) {
      message = (<span className="LoadingMessage text-muted">Loading...</span>);
    } else if (showMore) {
      message = (
        <span className="ShowMoreLink btn btn-link">Show more</span>
      );
    } else {
      message = 'No more notifications.';
    }

    return (
      <div className={`NotificationList ${open ? 'NotificationList--open' : ''}`}>
        <div className="NotificationList-body">
          <div>
            {events.ids.map((id, index) =>
              <NotificationListItem
                key={index}
                onClick={onClickItem}
                event={eventMap[id]}
              />)}
            <div
              className="NotificationList-listItem NotificationList-end text-sm-center"
              onClick={showMore ? this.onClickShowMore : null}
            >
              {message}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NotificationList.propTypes = {
  open: PropTypes.bool.isRequired,
  events: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  onClickItem: PropTypes.func,
  onClickShowMore: PropTypes.func,
};

NotificationList.defaultProps = {
  open: false,
};

const mapStateToProps = (state) => ({
  open: Boolean(state.notifications.open),
  events: state.api.events,
});

export default compose(
  connect(mapStateToProps),
  withRouter,
)(NotificationList);
