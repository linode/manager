import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setStorage } from '~/storage';
import { changeView } from '~/linodes/actions';
import { LOGIN_ROOT } from '~/constants';

export class Logout extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    // Reset defaults
    dispatch(changeView('list'));

    // Drop session info
    setStorage('authentication/oauth-token', undefined);
    setStorage('authentication/scopes', undefined);
    setStorage('authentication/username', undefined);
    setStorage('authentication/email', undefined);
    setStorage('authentication/email-hash', undefined);

    window.location = `${LOGIN_ROOT}/logout`;
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
  redirect: (location) => { window.location = location; },
};

export default connect()(Logout);
