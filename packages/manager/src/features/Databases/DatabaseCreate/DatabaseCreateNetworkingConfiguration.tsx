import { Typography } from '@linode/ui';
import * as React from 'react';

import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import { DatabaseCreateVPC } from './DatabaseCreateVPC';

import type { AccessProps } from './DatabaseCreateAccessControls';
import type { VPC } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

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
      <Typography variant="h2">Configure Networking</Typography>
      <Typography
        sx={(theme: Theme) => ({
          marginBottom: theme.spacingFunction(20),
        })}
      >
        Configure networking options for the cluster.
      </Typography>

      <DatabaseCreateAccessControls {...accessControlsConfiguration} />
      <DatabaseCreateVPC onChange={onChange} />
    </>
  );
};
