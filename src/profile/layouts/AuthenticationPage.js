import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { ChainedDocumentTitle } from '~/components';

import { ChangePassword, TwoFactor } from '../components';


export function AuthenticationPage(props) {
  return (
    <div>
      <ChainedDocumentTitle title="Password & Authentication" />
      <section>
        <ChangePassword dispatch={props.dispatch} />
      </section>
      <TwoFactor
        dispatch={props.dispatch}
        tfaEnabled={props.profile.two_factor_auth}
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
