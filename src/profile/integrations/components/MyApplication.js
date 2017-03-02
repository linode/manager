import React, { PropTypes } from 'react';

import { API_ROOT } from '~/constants';
import { SecondaryCard } from '~/components/cards/';
import { Button } from '~/components/buttons';
import EditApplication from './EditApplication';
import { showModal, hideModal } from '~/actions/modal';

export default function MyApplication(props) {
  const { client, dispatch } = props;

  const nav = (
    <Button
      onClick={() => dispatch(showModal(
        'Edit OAuth Client',
        <EditApplication
          id={client.id}
          name={client.name}
          redirect={client.redirect_uri}
          dispatch={dispatch}
          close={() => dispatch(hideModal())}
        />))}
    >Edit</Button>
  );

  return (
    <SecondaryCard
      title={client.name}
      icon={`${API_ROOT}/account/clients/${client.id}/thumbnail`}
      nav={nav}
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

MyApplication.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
