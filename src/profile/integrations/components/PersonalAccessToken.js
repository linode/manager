import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardImageHeader } from 'linode-components/cards/';
import { Dropdown } from 'linode-components/dropdowns';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';

import { showModal, hideModal } from '~/actions/modal';
import { tokens as apiTokens } from '~/api';
import { AuthScopeCell } from '~/components/tables/cells';
import TimeDisplay from '~/components/TimeDisplay';
import { OAUTH_SCOPES, OAUTH_SUBSCOPES } from '~/constants';

import EditPersonalAccessToken from './EditPersonalAccessToken';
import { formatScope } from '../utilities';


export default class PersonalAccessToken extends Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }

  editAction = () => {
    const { dispatch, label, id } = this.props;
    const title = 'Edit Personal Access Token';

    dispatch(showModal(title,
      <EditPersonalAccessToken
        id={id}
        label={label}
        title={title}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  deleteAction = () => {
    const { dispatch, id, label } = this.props;

    dispatch(showModal('Delete Personal Access Token',
      <DeleteModalBody
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
    const { label, scopes, expires, secret } = this.props;

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    const groups = [
      { elements: [{ name: 'Edit', action: this.editAction }] },
      { elements: [{ name: 'Delete', action: this.deleteAction }] },
    ];

    const header = (
      <CardImageHeader
        title={label}
        nav={<Dropdown groups={groups} leftOriented={false} />}
      />
    );

    return (
      <Card header={header}>
        <div className="row">
          <label className="col-sm-4 row-label">Expires in</label>
          <div className="col-sm-8"><TimeDisplay time={expires} /></div>
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
                formatFn: formatScope,
              },
            ].concat(OAUTH_SUBSCOPES.map((subscope) => ({
              subscope,
              cellComponent: AuthScopeCell,
              headerClassName: 'AuthScopeColumn',
            })))}
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
  id: PropTypes.number.isRequired,
  secret: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    tokens: state.api.tokens,
  };
}

connect(select)(PersonalAccessToken);
