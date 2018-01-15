import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Card from 'linode-components/dist/cards/Card';

import { selectUser } from './IndexPage';
import { UserForm } from '../../components';


export function EditUserPage(props) {
  const { user, dispatch } = props;

  return (
    <Card>
      <UserForm user={user} dispatch={dispatch} />
    </Card>
  );
}

EditUserPage.propTypes = {
  user: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectUser)(EditUserPage);
