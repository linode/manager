import React, { Component, PropTypes } from 'react';

import { Card, CardImageHeader } from 'linode-components/cards';
import { Dropdown } from 'linode-components/dropdowns';
import { ConfirmModalBody, DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { clients } from '~/api';
import { resetSecret } from '~/api/clients';
import { dispatchOrStoreErrors } from '~/api/util';
import { API_ROOT } from '~/constants';

import { renderSecret } from './CreatePersonalAccessToken';
import CreateOrEditApplication from './CreateOrEditApplication';


export default class MyApplication extends Component {
  deleteApp = async () => {
    const { client, dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => clients.delete(client.id),
    ]));
  }

  editAction = () => {
    const { dispatch, client } = this.props;

    return dispatch(showModal('Edit OAuth Client',
      <CreateOrEditApplication
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
    return dispatch(showModal('Delete OAuth Client',
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

    return dispatch(showModal('Reset Client Secret',
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={async () => {
          const { secret } = await dispatch(resetSecret(client.id));
          return dispatch(renderSecret(
            'client secret', 'reset', secret, () => dispatch(hideModal())));
        }}
      >
        Are you sure you want to reset <strong>{client.label}</strong>'s secret?
      </ConfirmModalBody>
    ));
  }

  renderActions() {
    const elements = [
      { name: 'Edit', action: this.editAction },
      { name: 'Reset secret', action: this.resetAction },
      null,
      { name: 'Delete', action: this.deleteAction },
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
