import React, { PropTypes } from 'react';

import { API_ROOT } from '~/constants';
import { SecondaryCard } from '~/components/cards/';
import { OAUTH_SUBSCOPES, OAUTH_SCOPES } from '~/constants';

export function title(s) {
  return s.split(' ').map(s => s[0].toUpperCase() + s.substring(1)).join('');
}

function renderScope(scopesRequested, currentScope, currentSubscope) {
  const subscopeAllowed = <small><strong>{title(currentSubscope)}</strong></small>;
  const subscopeNotAllowed = <small className="text-muted"><s>{title(currentSubscope)}</s></small>;

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

export default function AuthorizedApplication(props) {
  const { client } = props;

  return (
    <SecondaryCard
      title={client.client.label}
      icon={`${API_ROOT}/account/clients/${client.client.id}/thumbnail`}
    >
      <p>This application has access to your:</p>
      <table>
        <tbody>
          {OAUTH_SCOPES.map((scope, i) =>
            <tr key={i}>
              <td>{title(scope)}</td>
              {OAUTH_SUBSCOPES.map((subscope, j) =>
                <td key={j}>{renderScope(client.scopes, scope, subscope)}</td>)}
            </tr>)}
        </tbody>
      </table>
    </SecondaryCard>
  );
}

AuthorizedApplication.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
