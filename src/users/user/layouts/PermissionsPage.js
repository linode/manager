import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { users } from '~/api';

export class PermissionsPage extends Component {
  render() {
    console.log(this.props);
    return (
      <div>To Do</div>
    );
  }
}

PermissionsPage.propTypes = {
  users: PropTypes.object,
  params: PropTypes.shape({
    username: PropTypes.string,
  }),
  username: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(PermissionsPage);
