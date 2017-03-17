import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import { Input, Form, FormGroup, FormGroupError, SubmitButton } from '~/components/form';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { reduceErrors, ErrorSummary } from '~/errors';
import { UserForm } from '../components/UserForm';

export class AddUserPage extends Component {
  render() {
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1>Users</h1>
           </div>
        </header>
        <div className="PrimaryPage-body User-create">
          <Card title="Add a user">
            <UserForm
              permissions={true}
              permissionsLabel="Restricted user
                (Customize permissions)"
            />
          </Card>
        </div>
      </div>
    );
  }
}

AddUserPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function select() {
  return {};
}

export default connect(select)(AddUserPage);
