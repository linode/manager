import { Component } from 'react';
import { connect } from 'react-redux';

import { logout } from 'src/actions/authentication';
import { LOGIN_ROOT } from 'src/constants';
import * as session from 'src/session';
import { TodoAny } from 'src/utils';


export class Logout extends Component {
  componentDidMount() {
    const { dispatch } = this.props as TodoAny;

    // Drop session info
    session.expire();

    // Reset state
    dispatch(logout());

    window.location.href = `${LOGIN_ROOT}/logout`;
  }

  render() {
    return null;
  }
}

export default connect()(Logout);
