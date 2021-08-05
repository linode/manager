import * as React from 'react';
import { LinodeDetailContextConsumer } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';
import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeWatchdogPanel from './LinodeWatchdogPanel';

interface Props {
  isBareMetalInstance: boolean;
}

type CombinedProps = Props;

const LinodeSettings: React.FC<CombinedProps> = (props) => {
  const { isBareMetalInstance } = props;

  return (
    <LinodeDetailContextConsumer>
      {({ linode }) => {
        if (!linode) {
          return null;
        }

        const permissionsError =
          linode._permissions === 'read_only' ? (
            <LinodePermissionsError />
          ) : null;

        return (
          <>
            {permissionsError}
            <LinodeSettingsLabelPanel />
            <LinodeSettingsPasswordPanel
              isBareMetalInstance={isBareMetalInstance}
              linodeId={linode.id}
              linodeStatus={linode.status}
            />
            <LinodeSettingsAlertsPanel
              isBareMetalInstance={isBareMetalInstance}
              linodeId={linode.id}
              linodeLabel={linode.label}
              linodeAlerts={linode.alerts}
            />
            <LinodeWatchdogPanel
              linodeId={linode.id}
              currentStatus={linode.watchdog_enabled}
            />
            <LinodeSettingsDeletePanel
              linodeId={linode.id}
              linodeLabel={linode.label}
            />
          </>
        );
      }}
    </LinodeDetailContextConsumer>
  );
};

export default LinodeSettings;
