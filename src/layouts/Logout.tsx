import { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import { LOGIN_ROOT } from 'src/constants';
import * as session from 'src/session';
import { ApplicationState } from 'src/store';
import { logout } from 'src/store/authentication';

interface Props {
  dispatch: Dispatch<ApplicationState>;
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
