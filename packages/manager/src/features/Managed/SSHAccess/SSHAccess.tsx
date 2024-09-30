import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';

const SSHAcess = () => {
  return (
    <>
      <DocumentTitleSegment segment="SSH Access" />
      <LinodePubKey />
      <SSHAccessTable />
    </>
  );
};

export const ManagedSSHAccessLazyRoute = createLazyRoute('/managed/ssh-access')(
  {
    component: SSHAcess,
  }
);

export default SSHAcess;
