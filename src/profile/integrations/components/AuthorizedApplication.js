import _ from 'lodash';
import React, { PropTypes, Component } from 'react';

import { Button } from 'linode-components/buttons/';
import { Card, CardImageHeader } from 'linode-components/cards/';
import { Table } from 'linode-components/tables';
import TimeDisplay from '~/components/TimeDisplay';
import { AuthScopeCell } from '~/components/tables/cells';

import { tokens } from '~/api';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES, API_ROOT } from '~/constants';
import { dispatchOrStoreErrors } from '~/components/forms';


export default class AuthorizedApplication extends Component {
  revokeApp(id) {
    const { dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => tokens.delete(id),
    ]));
  }

  render() {
    const { label, scopes, id, clientId, expires } = this.props;
    const icon = clientId ? `${API_ROOT}/account/clients/${clientId}/thumbnail` : '';
    const expireValue = <TimeDisplay time={expires} />;

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    const nav = <Button onClick={() => this.revokeApp(id)}>Revoke</Button>;
    const header = <CardImageHeader title={label} icon={icon} nav={nav} />;

    return (
      <Card header={header}>
        <div className="row">
          <label className="col-sm-4 row-label">Expires</label>
          <div className="col-sm-8">{expireValue}</div>
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

AuthorizedApplication.propTypes = {
  label: PropTypes.string.isRequired,
  scopes: PropTypes.string.isRequired,
  id: PropTypes.any.isRequired,
  clientId: PropTypes.any.isRequired,
  expires: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
