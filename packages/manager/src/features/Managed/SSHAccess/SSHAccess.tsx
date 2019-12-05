import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';

const SSHAcess: React.FC<{}> = props => {
  return (
    <>
      <div
        id="tabpanel-managed-ssh-access"
        role="tabpanel"
        aria-labelledby="tab-managed-ssh-access"
      >
        <DocumentTitleSegment segment="SSH Access" />
        <LinodePubKey />
        <SSHAccessTable />
      </div>
    </>
  );
};

export default SSHAcess;
