import React, { PropTypes, Component } from 'react';

import NotificationListItem from './NotificationListItem';


export default class NotificationList extends Component {

  constructor(props) {
    super(props);

    this.onClickShowMore = this.onClickShowMore.bind(this);

    this.state = { totalResults: props.events.totalResults || 0 };
  }

  componentWillUpdate(nextProps) {
    this.updateTotalResults(nextProps.events);
  }

  onClickShowMore(e) {
    e.preventDefault();
    this.props.onClickShowMore(e);
  }

  updateTotalResults(events) {
    if (events.totalResults > this.state.totalResults) {
      this.setState({ totalResults: events.totalResults });
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
  events: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  open: PropTypes.bool.isRequired,
  onClickItem: PropTypes.func,
  onClickShowMore: PropTypes.func,
};

NotificationList.defaultProps = {
  open: false,
};
