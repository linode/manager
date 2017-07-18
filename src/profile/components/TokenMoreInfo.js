import React, { PropTypes, Component } from 'react';

import { ConfirmModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { AuthScopeCell } from '~/components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';

import { formatScope } from '../utilities';


export default class TokenMoreInfo extends Component {
  static title = 'Token Scopes'

  static trigger(dispatch, token) {
    return dispatch(showModal(TokenMoreInfo.title, (
      <ConfirmModalBody
        noCancel
        onOk={() => dispatch(hideModal())}
        buttonText="Done"
      >
        <TokenMoreInfo scopes={token.scopes} />
      </ConfirmModalBody>
    )));
  }

  render() {
    const { scopes } = this.props;

    const scopeData = OAUTH_SCOPES.map(function (scope) {
      return { scopes: scopes, scope: scope };
    });

    return (
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
    );
  }
}

TokenMoreInfo.propTypes = {
  scopes: PropTypes.string.isRequired,
};
