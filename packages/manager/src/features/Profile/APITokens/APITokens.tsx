import { Stack } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { APITokenTable } from './APITokenTable';

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

export const APITokensLazyRoute = createLazyRoute('/profile/tokens')({
  component: APITokens,
});
