import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import LinodePubKey from './LinodePubKey';
import { SSHAccessTable } from './SSHAccessTable';

export const SSHAccess = () => {
  return (
    <>
      <DocumentTitleSegment segment="SSH Access" />
      <LinodePubKey />
      <SSHAccessTable />
    </>
  );
};
