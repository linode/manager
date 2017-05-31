import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { ChangePassword, TwoFactor } from '../components';


export function AuthenticationPage(props) {
  return (
    <div>
      <section>
        <ChangePassword dispatch={props.dispatch} />
      </section>
      <TwoFactor
        dispatch={props.dispatch}
        tfaEnabled={props.profile.two_factor_auth === 'enabled'}
        username={props.profile.username}
      />
    </div>
  );
}

AuthenticationPage.propTypes = {
  dispatch: PropTypes.func,
  profile: PropTypes.object,
};

function select(state) {
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(AuthenticationPage);
