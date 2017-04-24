import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { API_ROOT } from '~/constants';
import { Dropdown } from 'linode-components/dropdowns';
import EditPersonalAccessToken from './EditPersonalAccessToken';
import { Card, CardImageHeader } from 'linode-components/cards/';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import TimeDisplay from '~/components/TimeDisplay';
import { AuthScopeCell } from '~/components/tables/cells';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { showModal, hideModal } from '~/actions/modal';
import { tokens as apiTokens } from '~/api';

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
    const { dispatch, id, label } = this.props;

    dispatch(showModal('Delete Personal Access Token',
      <DeleteModalBody
        buttonText="Delete personal access token"
        onCancel={() => dispatch(hideModal())}
        onOk={() => {
          dispatch(apiTokens.delete(id));
          dispatch(hideModal());
        }}
        typeOfItem="Personal access tokens"
        items={[label]}
      />
    ));
  }

  render() {
    const { label, scopes, id, expires, secret } = this.props;
    const icon = id ? `${API_ROOT}/account/clients/${id}/thumbnail` : '';
    const expireValue = <TimeDisplay time={expires} />;

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    const elements = [
      { name: 'Edit', action: this.editAction },
      { name: 'Delete', action: this.deleteAction },
    ];

    return (
      <Card
        header={
          <CardImageHeader
            title={label}
            icon={icon}
            nav={<Dropdown elements={elements} leftOriented={false} />}
          />
        }
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
      </Card>
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

function select(state) {
  return {
    tokens: state.api.tokens,
  };
}

connect(select)(PersonalAccessToken);
