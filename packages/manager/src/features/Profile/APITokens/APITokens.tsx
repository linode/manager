import * as React from 'react';
import { APITokenTable } from './APITokenTable';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Stack } from '@mui/material';

export const APITokens = () => {
  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="API Tokens" />
      <APITokenTable
        title="Personal Access Tokens"
        type="Personal Access Token"
      />
      <APITokenTable
        title="Third Party Access Tokens"
        type="OAuth Client Token"
      />
    </Stack>
  );
};
