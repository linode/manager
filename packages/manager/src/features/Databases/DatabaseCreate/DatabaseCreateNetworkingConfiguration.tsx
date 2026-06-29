import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import { DatabaseCreateVPC } from './DatabaseCreateVPC';

import type { AccessProps } from './DatabaseCreateAccessControls';
import type { VPC } from '@linode/api-v4';

interface NetworkingConfigurationProps {
  accessControlsConfiguration: AccessProps;
  onChange: (selectedVPC: null | VPC) => void;
}

export const DatabaseCreateNetworkingConfiguration = (
  props: NetworkingConfigurationProps
) => {
  const { accessControlsConfiguration, onChange } = props;

  return (
    <>
      <h3 style={{ margin: 0 }}>Configure Networking</h3>
      <p style={{ marginTop: 0, marginBottom: Spacing.S20 }}>
        Configure networking options for the cluster.
      </p>

      <DatabaseCreateAccessControls {...accessControlsConfiguration} />
      <DatabaseCreateVPC onChange={onChange} />
    </>
  );
};
