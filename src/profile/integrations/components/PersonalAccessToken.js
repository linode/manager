import React, { PropTypes, Component } from 'react';
import moment from 'moment';

import _ from 'lodash';
import { API_ROOT } from '~/constants';
import Dropdown from '~/components/Dropdown';
import EditPersonalAccessToken from './EditPersonalAccessToken';
import { SecondaryCard } from '~/components/cards/';
import { ConfirmModalBody } from '~/components/modals';
import { Table } from '~/components/tables';
import { AuthScopeCell } from '~/components/tables/cells';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { showModal, hideModal } from '~/actions/modal';
import { tokens } from '~/api';

export default class PersonalAccessToken extends Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }

  editAction = () => {
    const { dispatch, label, id } = this.props;

    dispatch(showModal('Edit Personal Access Token',
      <EditPersonalAccessToken
        id={id}
        label={label}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  deleteAction = () => {
    const { dispatch, label, id } = this.props;

    dispatch(showModal('Delete Personal Access Token',
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={() => {
          dispatch(tokens.delete(id));
          dispatch(hideModal());
        }}
      >
        Are you sure you want to delete <strong>{label}</strong>?
      </ConfirmModalBody>
    ));
  }

  render() {
    const { label, scopes, id, expires, secret } = this.props;
    const icon = id ? `${API_ROOT}/account/clients/${id}/thumbnail` : '';

    let expireValue = moment.utc(expires, moment.ISO_8601).fromNow();
    expireValue = expireValue[0].toUpperCase() + expireValue.substring(1);

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    const elements = [
      { name: 'Edit', action: this.editAction },
      { name: 'Delete', action: this.deleteAction },
    ];

    return (
      <SecondaryCard
        title={label}
        icon={icon}
        nav={<Dropdown elements={elements} leftOriented={false} />}
      >
        <div className="row">
          <label className="col-sm-4 row-label">Expires in</label>
          <div className="col-sm-8">{expireValue}</div>
        </div>
        <div className="row">
          <label className="col-sm-4 row-label">Secret</label>
          <div className="col-sm-8">{secret.substring(0, 16)}...</div>
        </div>
        <div className="OAuthScopes">
          <p>This application has access to your:</p>
          <Table
            className="Table--secondary"
            columns={[
              {
                dataKey: 'scope',
                formatFn: _.capitalize,
              },
            ].concat(OAUTH_SUBSCOPES.map((subscope) => {
              return { cellComponent: AuthScopeCell, subscope: subscope };
            }))}
            data={scopeData}
          />
        </div>
      </SecondaryCard>
    );
  }
}

PersonalAccessToken.propTypes = {
  label: PropTypes.string.isRequired,
  scopes: PropTypes.string.isRequired,
  expires: PropTypes.string.isRequired,
  id: PropTypes.any.isRequired,
  secret: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
