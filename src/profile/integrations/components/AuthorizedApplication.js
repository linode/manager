import React, { PropTypes, Component } from 'react';
import _ from 'lodash';

import { API_ROOT } from '~/constants';
import { Button } from 'linode-components/buttons/';
import { Card, CardImageHeader } from 'linode-components/cards/';

import { tokens } from '~/api';
import { reduceErrors } from '~/components/forms';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { Table } from 'linode-components/tables';
import TimeDisplay from '~/components/TimeDisplay';
import { AuthScopeCell } from '~/components/tables/cells';


export default class AuthorizedApplication extends Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }

  async revokeApp(id) {
    const { dispatch } = this.props;

    try {
      await dispatch(tokens.delete(id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { label, scopes, id, expires } = this.props;
    const icon = id ? `${API_ROOT}/account/clients/${id}/thumbnail` : '';
    const expireValue = <TimeDisplay time={expires} />;

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    return (
      <Card
        header={
          <CardImageHeader
            title={label}
            icon={icon}
            nav={<Button onClick={() => this.revokeApp(id)}>Revoke</Button>}
          />
        }
      >
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

AuthorizedApplication.propTypes = {
  label: PropTypes.string.isRequired,
  scopes: PropTypes.string.isRequired,
  id: PropTypes.any.isRequired,
  expires: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
