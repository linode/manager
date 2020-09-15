import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import useFlags from 'src/hooks/useFlags';
import APITokenTable from './APITokenTable';
import APITokenTable_CMR from './APITokenTable_CMR';

export const APITokens: React.FC = () => {
  const flags = useFlags();
  const Table = flags.cmr ? APITokenTable_CMR : APITokenTable;

  return (
    <>
      <DocumentTitleSegment segment="API Tokens" />
      <Table title="Personal Access Tokens" type="Personal Access Token" />
      <Table title="Third Party Access Tokens" type="OAuth Client Token" />
    </>
  );
};

export default APITokens;
