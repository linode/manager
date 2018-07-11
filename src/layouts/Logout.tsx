import { Component } from 'react';
import { connect, Dispatch } from 'react-redux';

import { LOGIN_ROOT } from 'src/constants';
import * as session from 'src/session';
import { logout } from 'src/store/reducers/authentication';

interface Props {
  dispatch: Dispatch<Linode.AppState>;
}

export class Logout extends Component<Props> {
  componentDidMount() {
    const { dispatch } = this.props;

    // Drop session info
    session.expire();

    // Reset state
    dispatch(logout());

    window.location.assign(`${LOGIN_ROOT}/logout`);
  }

  render() {
    return null;
  }
}

export default connect()<Props>(Logout);
