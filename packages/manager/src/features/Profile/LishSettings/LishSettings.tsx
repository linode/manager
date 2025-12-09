import { Stack } from '@linode/ui';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { AuthorizedKeys } from './AuthorizedKeys';
import { LishAuthMode } from './LishAuthMode';

export const LishSettings = () => {
  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="LISH Console Settings" />
      <LishAuthMode />
      <AuthorizedKeys />
    </Stack>
  );
};
