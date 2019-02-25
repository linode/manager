import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { isDevelopment } from 'src/constants';
import APITokenTable from './APITokenTable';
import ObjectStorageKeys from './ObjectStorageKeys';

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

      {isDevelopment && <ObjectStorageKeys />}
    </React.Fragment>
  );
};

export default APITokens;
