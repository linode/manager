import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { logout } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import * as session from '~/session';


export class Logout extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    // Drop session info
    dispatch(session.expire);

    // Reset state
    dispatch(logout());

    // Called this way allows us to stub it out.
    session.redirect(`${LOGIN_ROOT}/logout`);
  }

  render() {
    return null;
  }
}

Logout.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Logout);
