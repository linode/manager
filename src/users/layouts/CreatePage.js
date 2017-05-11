import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card } from 'linode-components/cards';

import { UserForm } from '../components';


export function CreatePage(props) {
  const { dispatch } = props;

  return (
    <div className="PrimaryPage container">
      <Link to="/users">Users</Link>
      <header className="PrimaryPage-header">
        <div className="PrimaryPage-headerRow clearfix">
          <h1>Add a user</h1>
        </div>
      </header>
      <div className="PrimaryPage-body">
        <Card>
          <UserForm dispatch={dispatch} />
        </Card>
      </div>
    </div>
  );
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(CreatePage);
