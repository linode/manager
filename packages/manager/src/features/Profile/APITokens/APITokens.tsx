import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import APITokenTable from './APITokenTable';

export const APITokens: React.StatelessComponent = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="APITokens" />

      <APITokenTable
        title="Personal Access Tokens"
        type="Personal Access Token"
      />
      <APITokenTable
        title="Third Party Access Tokens"
        type="OAuth Client Token"
      />
    </React.Fragment>
  );
};

export default APITokens;
