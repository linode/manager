import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';

import ClientRow from './LongviewClientRow';

interface Props {
  longviewClientsData: LongviewClient[];
  openPackageDrawer: (id: number, label: string) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

type CombinedProps = Props;

const LongviewListRows: React.FC<CombinedProps> = props => {
  const {
    longviewClientsData,
    openPackageDrawer,
    triggerDeleteLongviewClient
  } = props;

  return (
    <React.Fragment>
      {longviewClientsData.map(eachClient => {
        return (
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
        );
      })}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewListRows);
