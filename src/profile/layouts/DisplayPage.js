import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { ChangeTimezone, ChangeEmail } from '../components';


export function DisplayPage(props) {
  return (
    <div>
      <ChangeTimezone
        dispatch={props.dispatch}
        timezone={props.profile.timezone}
      />
      <ChangeEmail
        dispatch={props.dispatch}
        email={props.profile.email}
      />
    </div>
  );
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
