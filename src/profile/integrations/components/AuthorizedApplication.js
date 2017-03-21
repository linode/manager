import React, { PropTypes, Component } from 'react';

import moment from 'moment';
import _ from 'lodash';

import { API_ROOT } from '~/constants';
import { Button } from '~/components/buttons/';
import { SecondaryCard } from '~/components/cards/';

import { tokens } from '~/api';
import { reduceErrors } from '~/errors';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';
import { Table } from '~/components/tables';
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

    let expireValue = moment.utc(expires, moment.ISO_8601).fromNow();
    expireValue = expireValue[0].toUpperCase() + expireValue.substring(1);

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    return (
      <SecondaryCard
        title={label}
        icon={icon}
        nav={<Button onClick={() => this.revokeApp(id)}>Revoke</Button>}
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
      </SecondaryCard>
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
