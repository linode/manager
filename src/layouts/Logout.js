import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { LOGIN_ROOT } from '~/constants';
import { logout } from '~/actions/authentication';
import * as session from '~/session';

export class Logout extends Component {
  componentDidMount() {
    const { dispatch, redirect } = this.props;

    // Drop session info
    dispatch(session.expire);

    // Reset state
    dispatch(logout());

    redirect(`${LOGIN_ROOT}/logout`);
  }

  render() {
    return null;
  }
}

Logout.propTypes = {
  dispatch: PropTypes.func.isRequired,
  redirect: PropTypes.func.isRequired, // Allow window.location to be stubbed
};

Logout.defaultProps = {
  redirect: session.redirect,
};

export default connect()(Logout);
