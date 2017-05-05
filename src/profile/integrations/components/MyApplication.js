import React, { Component, PropTypes } from 'react';

import { Card, CardImageHeader } from 'linode-components/cards';
import { Dropdown } from 'linode-components/dropdowns';
import { ConfirmModalBody, DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { clients } from '~/api';
import { resetSecret } from '~/api/clients';
import { reduceErrors } from '~/components/forms';
import { API_ROOT } from '~/constants';

import { renderSecret } from './CreatePersonalAccessToken';
import { CreateOrEditApplication } from './';


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
      <CreateOrEditApplication
        id={client.id}
        label={client.label}
        redirect={client.redirect_uri}
        dispatch={dispatch}
        saveOrCreate={(label, redirect) =>
          clients.put({ label, redirect_uri: redirect }, [client.id])}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  deleteAction = () => {
    const { dispatch, client } = this.props;
    dispatch(showModal('Delete OAuth Client',
      <DeleteModalBody
        onOk={() => {
          dispatch(hideModal());
          this.deleteApp();
        }}
        onCancel={() => dispatch(hideModal())}
        typeOfItem="Clients"
        items={[client.label]}
      />
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
      <Card
        header={
          <CardImageHeader
            title={client.label}
            icon={`${API_ROOT}/account/clients/${client.id}/thumbnail`}
            nav={this.renderActions()}
          />
        }
      >
        <div className="row">
          <label className="col-sm-4 row-label">Client ID</label>
          <div className="col-sm-8" id="clientId">{client.id}</div>
        </div>
        <div className="row">
          <label className="col-sm-4 row-label">Redirect URI</label>
          <div className="col-sm-8" id="redirect">{client.redirect_uri}</div>
        </div>
      </Card>
    );
  }
}

MyApplication.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
