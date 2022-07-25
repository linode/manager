import * as React from 'react';
import { LongviewClient } from '@linode/api-v4/lib/longview';
import ClientRow from './LongviewClientRow';

interface Props {
  longviewClientsData: LongviewClient[];
  openPackageDrawer: (id: number, label: string) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

const LongviewListRows = (props: Props) => {
  const {
    longviewClientsData,
    openPackageDrawer,
    triggerDeleteLongviewClient,
  } = props;

  return (
    // eslint-disable-next-line
    <React.Fragment>
      {longviewClientsData.map((eachClient) => (
        <ClientRow
          key={`longview-client-${eachClient.label}`}
          clientInstallKey={eachClient.install_code}
          clientID={eachClient.id}
          clientLabel={eachClient.label}
          clientAPIKey={eachClient.api_key}
          openPackageDrawer={() =>
            openPackageDrawer(eachClient.id, eachClient.label)
          }
          triggerDeleteLongviewClient={triggerDeleteLongviewClient}
        />
      ))}
    </React.Fragment>
  );
};

export default React.memo(LongviewListRows);
