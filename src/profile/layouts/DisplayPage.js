import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ChangeTimezone, ChangeEmail } from '../components';


export class DisplayPage extends Component {
  render() {
    const { dispatch, profile } = this.props;

    return (
      <div>
        <section>
          <ChangeTimezone
            dispatch={dispatch}
            timezone={profile.timezone}
          />
        </section>
        <ChangeEmail
          dispatch={dispatch}
          email={profile.email}
        />
      </div>
    );
  }
}

DisplayPage.propTypes = {
  dispatch: PropTypes.func,
  profile: PropTypes.object,
};

function select(state) {
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(DisplayPage);
