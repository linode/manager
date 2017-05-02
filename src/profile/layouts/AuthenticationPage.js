import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { ChangePassword, TwoFactor } from '../components';


export function AuthenticationPage(props) {
  return (
    <div>
      <ChangePassword dispatch={props.dispatch} />
      <TwoFactor dispatch={props.dispatch} profile={props.profile} />
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
