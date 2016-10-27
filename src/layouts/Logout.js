import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { changeView } from '~/linodes/actions';
import { LOGIN_ROOT } from '~/constants';
import { logout } from '~/actions/authentication';
import { setSession } from './OAuth';

export class Logout extends Component {
  constructor() {
    super();
    this.setSession = setSession.bind(this);
  }

  componentDidMount() {
    const { dispatch, redirect } = this.props;
    // Reset defaults
    dispatch(changeView('list'));

    // Drop session info
    this.setSession();

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
  redirect: (location) => { window.location = location; },
};

export default connect()(Logout);
