import React, { PropTypes, Component } from 'react';
import moment from 'moment';

import { API_ROOT } from '~/constants';
import { Button } from '~/components/buttons/';
import { SecondaryCard } from '~/components/cards/';
import { tokens } from '~/api';
import { reduceErrors } from '~/errors';
import OAuthScopes from './OAuthScopes';

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
        <OAuthScopes type="application" scopes={scopes} />
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
