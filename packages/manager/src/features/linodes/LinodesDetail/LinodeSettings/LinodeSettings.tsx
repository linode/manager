import * as React from 'react';
import { LinodeDetailContextConsumer } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import LinodeSettingsDeletePanel from './LinodeSettingsDeletePanel';
import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';

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
