import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { AppTokenTable, PersonalTokenTable } from './APITokenTable';

export const APITokens: React.StatelessComponent = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="APITokens" />

      <PersonalTokenTable title="Personal Access Tokens" type="Personal Access Token" />

      <AppTokenTable title="Apps" type="OAuth Client Tokens" />
    </React.Fragment>
  )
}

export default APITokens;