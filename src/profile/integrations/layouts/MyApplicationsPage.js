import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import CreateHelper from '~/components/CreateHelper';
import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import { clients } from '~/api';
import { Button } from '~/components/buttons';
import MyApplication from '../components/MyApplication';
import CreateApplication from '../components/CreateApplication';

export class MyApplicationsPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(clients.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  renderCreateOAuthClient() {
    const { dispatch } = this.props;
    dispatch(showModal('Create an OAuth Client', (
      <CreateApplication
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  render() {
    const { dispatch } = this.props;

    const clients = Object.values(this.props.clients.clients);

    return (
      <div>
        <header className="NavigationHeader clearfix">
          <Button onClick={() => this.renderCreateOAuthClient()} className="float-sm-right">
            Create an OAuth Client
          </Button>
        </header>
        <div className="row">
          {clients.length ? clients.map(client =>
            <div className="col-lg-6" key={client.id}>
              <MyApplication client={client} dispatch={dispatch} />
            </div>
           ) : (
            <CreateHelper
              label="OAuth Client"
              href="/profile/applications/create"
              linkText="Create an OAuth Client"
            />
           )}
        </div>
      </div>
    );
  }
}

MyApplicationsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  clients: PropTypes.object.isRequired,
};

function select(state) {
  return {
    clients: state.api.clients,
  };
}

export default connect(select)(MyApplicationsPage);
