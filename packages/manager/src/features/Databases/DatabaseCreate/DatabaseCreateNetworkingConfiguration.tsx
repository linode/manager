import { Typography } from '@linode/ui';
import * as React from 'react';

import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';
import { DatabaseVPCSelector } from './DatabaseVPCSelector';

import type { DatabaseCreateValues } from './DatabaseClusterData';
import type { AccessProps } from './DatabaseCreateAccessControls';
import type { PrivateNetwork, VPC } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { FormikErrors } from 'formik';

interface NetworkingConfigurationProps {
  accessControlsConfiguration: AccessProps;
  errors: FormikErrors<DatabaseCreateValues>;
  onChange: (field: string, value: boolean | null | number) => void;
  onNetworkingConfigurationChange: (vpcSelected: null | VPC) => void;
  privateNetworkValues: PrivateNetwork;
  resetFormFields: (partialValues?: Partial<DatabaseCreateValues>) => void;
  selectedRegionId: string;
}

export const DatabaseCreateNetworkingConfiguration = (
  props: NetworkingConfigurationProps
) => {
  const {
    accessControlsConfiguration,
    errors,
    onNetworkingConfigurationChange,
    onChange,
    selectedRegionId,
    resetFormFields,
    privateNetworkValues,
  } = props;

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
      <DatabaseVPCSelector
        errors={errors}
        onChange={onChange}
        onConfigurationChange={onNetworkingConfigurationChange}
        privateNetworkValues={privateNetworkValues}
        resetFormFields={resetFormFields}
        selectedRegionId={selectedRegionId}
      />
    </>
  );
};
