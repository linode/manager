import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import APITokenTable from './APITokenTable';

export const APITokens: React.StatelessComponent = () => {
  return (
    <div
      id="tabpanel-apiTokens"
      role="tabpanel"
      aria-labelledby="tab-apiTokens"
    >
      <DocumentTitleSegment segment="API Tokens" />

      <APITokenTable
        title="Personal Access Tokens"
        type="Personal Access Token"
      />
      <APITokenTable
        title="Third Party Access Tokens"
        type="OAuth Client Token"
      />
    </div>
  );
};

export default APITokens;
