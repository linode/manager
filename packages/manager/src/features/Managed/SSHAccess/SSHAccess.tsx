import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';

const SSHAcess: React.FC<{}> = props => {
  return (
    <>
      <div
        id="tabpanel-sshAccess"
        role="tabpanel"
        aria-labelledby="tab-sshAccess"
      >
        <DocumentTitleSegment segment="SSH Access" />
        <LinodePubKey />
        <SSHAccessTable />
      </div>
    </>
  );
};

export default SSHAcess;
