import React, { PropTypes } from 'react';

import { SecondaryCard } from '~/components/cards/';

export default function MyApplication(props) {
  const { client } = props;

  return (
    <SecondaryCard title={client.name}>
      <div className="row">
        <label className="col-sm-4 row-label">Client ID</label>
        <div className="col-sm-8">{client.id}</div>
      </div>
      <div className="row">
        <label className="col-sm-4 row-label">Redirect URI</label>
        <div className="col-sm-8">{client.redirect_uri}</div>
      </div>
    </SecondaryCard>
  );
}

MyApplication.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
