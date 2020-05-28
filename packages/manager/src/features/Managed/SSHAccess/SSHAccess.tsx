import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';

const SSHAcess: React.FC<{}> = () => {
  return (
    <div>
      <DocumentTitleSegment segment="SSH Access" />
      <LinodePubKey />
      <SSHAccessTable />
    </div>
  );
};

export default SSHAcess;
