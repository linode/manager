import React, { PropTypes } from 'react';

import _ from 'lodash';
import { OAUTH_SUBSCOPES } from '~/constants';
import TableCell from './TableCell';

function renderScope(scopesRequested, currentScope, currentSubscope) {
  const subscopeAllowed = (
    <small>
      <strong>{_.capitalize(currentSubscope)}</strong>
    </small>
  );
  const subscopeNotAllowed = (
    <small className="text-muted">
      <s>{_.capitalize(currentSubscope)}</s>
    </small>
  );

  if (scopesRequested === '*') {
    return subscopeAllowed;
  }

  const scopeList = scopesRequested.split(',');
  const scopeInQuestion = scopeList.filter(scope => scope.split(':')[0] === currentScope)[0];
  if (!scopeInQuestion) {
    return subscopeNotAllowed;
  }

  const [scope, subscope] = scopeInQuestion.split(':');
  const allScopes = scope === '*';
  const allSubscopes = subscope === '*';
  if (allScopes || allSubscopes) {
    return subscopeAllowed;
  }

  const indexOfSubscopeRequested = OAUTH_SUBSCOPES.indexOf(subscope);
  const indexOfCurrentSubscope = OAUTH_SUBSCOPES.indexOf(currentSubscope);
  if (indexOfSubscopeRequested >= indexOfCurrentSubscope) {
    return subscopeAllowed;
  }

  return subscopeNotAllowed;
}

export default function AuthScopeCell(props) {
  const { column, record } = props;

  return (
    <TableCell className="AuthScopeCell" column={column} record={record}>
      {renderScope(record.scopes, record.scope, column.subscope)}
    </TableCell>
  );
}

AuthScopeCell.propTypes = {
  column: PropTypes.shape({
    subscope: PropTypes.string.isRequired,
  }),
  record: PropTypes.shape({
    scopes: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,
  }),
};
