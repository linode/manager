import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ChainedDocumentTitle } from '~/components';

import { ChangePassword, TwoFactor } from '../components';


export class AuthenticationPage extends Component {
  componentWillMount() {
    const { dispatch } = this.props;
  }

  render() {
    const { dispatch, profile } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title="Password & Authentication" />
        <section>
          <ChangePassword dispatch={dispatch} />
        </section>
        <TwoFactor
          dispatch={dispatch}
          tfaEnabled={profile.two_factor_auth}
          username={profile.username}
        />
      </div>
    );
  }
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
