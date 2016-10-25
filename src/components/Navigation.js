import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Link } from '~/components/Link';
import { hideModal } from '~/actions/modal';
import { showNotifications } from '~/actions/notifications';

export class Navigation extends Component {
  constructor() {
    super();
    this.hideShowNotifications = this.hideShowNotifications.bind(this);
  }

  async hideShowNotifications() {
    const { dispatch } = this.props;
    await dispatch(hideModal());
    await dispatch(showNotifications());
  }

  render() {
    const { username, emailHash } = this.props;
    const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;

    return (
      <nav id="main-nav" className="navbar navbar-default" role="navigation">
        <div className="navbar-header">
          <div className="navbar-linode nav-item">
            <Link to="/">
              <span className="fa fa-linode" />
            </Link>
          </div>
          <div className="navbar-search nav-item">
            <input placeholder="Search..." />
          </div>
          {!username ? null :
            <div
              className="navbar-session float-xs-right"
              onClick={this.hideShowNotifications}
            >
              <span className="nav-text nav-user">
                {username}
              </span>
              <div className="nav-gravatar">
                <img
                  className="nav-gravatar-img"
                  src={gravatarLink}
                  alt="User Avatar"
                  height={35}
                  width={35}
                />
                {/* <div className="nav-gravatar-badge">3</div> */}
              </div>
            </div>
          }
        </div>
      </nav>
    );
  }
}

Navigation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  username: PropTypes.string,
  emailHash: PropTypes.string,
  open: PropTypes.bool.isRequired,
};

function select(state) {
  return state.notifications;
}

export default connect(select)(Navigation);
