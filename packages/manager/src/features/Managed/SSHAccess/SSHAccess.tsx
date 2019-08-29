import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';

const SSHAcess: React.FC<{}> = props => {
  return (
    <>
      <DocumentTitleSegment segment="SSH Access" />
      <LinodePubKey />
      <SSHAccessTable />
    </>
  );
};

export default SSHAcess;
