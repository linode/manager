import * as React from 'react';

import ClientRow from './LongviewClientRow';

import type { LongviewClient } from '@linode/api-v4/lib/longview';
interface Props {
  longviewClientsData: LongviewClient[];
  openPackageDrawer: (id: number, label: string) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

export const LongviewListRows = React.memo((props: Props) => {
  const {
    longviewClientsData,
    openPackageDrawer,
    triggerDeleteLongviewClient,
  } = props;

  return (
    // eslint-disable-next-line
    <React.Fragment>
      {longviewClientsData.map((eachClient) => {
        return (
          <div
            data-qa-longview-client={eachClient.id}
            key={`longview-client-${eachClient.label}`}
          >
            <ClientRow
              openPackageDrawer={() =>
                openPackageDrawer(eachClient.id, eachClient.label)
              }
              clientAPIKey={eachClient.api_key}
              clientID={eachClient.id}
              clientInstallKey={eachClient.install_code}
              clientLabel={eachClient.label}
              triggerDeleteLongviewClient={triggerDeleteLongviewClient}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
});
