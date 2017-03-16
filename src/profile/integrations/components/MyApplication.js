import React, { Component, PropTypes } from 'react';

import { API_ROOT } from '~/constants';
import { SecondaryCard } from '~/components/cards/';
import Dropdown from '~/components/Dropdown';
import { reduceErrors } from '~/errors';
import EditApplication from './EditApplication';
import { ConfirmModalBody } from '~/components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { renderSecret } from './CreatePersonalAccessToken';
import { clients } from '~/api';
import { resetSecret } from '~/api/clients';

export default class MyApplication extends Component {
  constructor() {
    super();

    this.renderSecret = renderSecret.bind(this);
  }

  deleteApp = async () => {
    const { client, dispatch } = this.props;

    try {
      await dispatch(clients.delete(client.id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  editAction = () => {
    const { dispatch, client } = this.props;

    dispatch(showModal('Edit OAuth Client',
      <EditApplication
        id={client.id}
        label={client.label}
        redirect={client.redirect_uri}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  deleteAction = () => {
    const { dispatch, client } = this.props;

    dispatch(showModal('Delete OAuth Client',
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={() => {
          dispatch(hideModal());
          this.deleteApp();
        }}
      >
        Are you sure you want to delete <strong>{client.label}</strong>?
      </ConfirmModalBody>
    ));
  }

  resetAction = () => {
    const { dispatch, client } = this.props;

    dispatch(showModal('Reset client secret',
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={async () => {
          const { secret } = await dispatch(resetSecret(client.id));
          this.renderSecret('client secret', 'reset', secret);
        }}
      >
        Are you sure you want to reset <strong>{client.label}</strong>'s secret?
      </ConfirmModalBody>
    ));
  }

  renderActions() {
    const elements = [
      { name: 'Edit', action: this.editAction },
      { name: 'Delete', action: this.deleteAction },
      { name: 'Reset secret', action: this.resetAction },
    ];

    return <Dropdown elements={elements} leftOriented={false} />;
  }

  render() {
    const { client } = this.props;

    return (
      <SecondaryCard
        title={client.label}
        icon={`${API_ROOT}/account/clients/${client.id}/thumbnail`}
        nav={this.renderActions()}
      >
        <div className="row">
          <label className="col-sm-4 row-label">Client ID</label>
          <div className="col-sm-8" id="clientId">{client.id}</div>
        </div>
        <div className="row">
          <label className="col-sm-4 row-label">Redirect URI</label>
          <div className="col-sm-8" id="redirect">{client.redirect_uri}</div>
        </div>
      </SecondaryCard>
    );
  }
}

MyApplication.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
