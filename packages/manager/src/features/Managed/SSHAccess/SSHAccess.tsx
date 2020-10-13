import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import useFlags from 'src/hooks/useFlags';
import LinodePubKey from './LinodePubKey';
import SSHAccessTable from './SSHAccessTable';
import SSHAccessTable_CMR from './SSHAccessTable_CMR';

const SSHAcess: React.FC<{}> = () => {
  const flags = useFlags();

  return (
    <div>
      <DocumentTitleSegment segment="SSH Access" />
      <LinodePubKey />
      {flags.cmr ? <SSHAccessTable_CMR /> : <SSHAccessTable />}
    </div>
  );
};

export default SSHAcess;
