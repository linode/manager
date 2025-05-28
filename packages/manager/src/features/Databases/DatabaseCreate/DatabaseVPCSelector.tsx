import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  Notice,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import type { DatabaseCreateValues } from './DatabaseClusterData';
import type { PrivateNetwork, VPC } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { FormikErrors } from 'formik';

interface DatabaseVPCSelectorProps {
  errors: FormikErrors<DatabaseCreateValues>;
  onChange: (field: string, value: boolean | null | number) => void;
  onConfigurationChange: (vpc: null | VPC) => void;
  privateNetworkValues: PrivateNetwork;
  resetFormFields: (partialValues?: Partial<DatabaseCreateValues>) => void;
  selectedRegionId: string;
}

export const DatabaseVPCSelector = (props: DatabaseVPCSelectorProps) => {
  const {
    errors,
    onConfigurationChange,
    onChange,
    selectedRegionId,
    resetFormFields,
    privateNetworkValues,
  } = props;

  const { data: selectedRegion } = useRegionQuery(selectedRegionId);
  const regionSupportsVPCs = selectedRegion?.capabilities.includes('VPCs');

  const {
    data: vpcs,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: selectedRegionId },
  });

  const selectedVPC = React.useMemo(
    () => vpcs?.find((vpc) => vpc.id === privateNetworkValues.vpc_id),
    [vpcs, privateNetworkValues.vpc_id]
  );
  const selectedSubnet = React.useMemo(
    () =>
      selectedVPC?.subnets.find(
        (subnet) => subnet.id === privateNetworkValues.subnet_id
      ),
    [selectedVPC, privateNetworkValues.subnet_id]
  );

  const prevRegionId = React.useRef<string | undefined>();
  const regionHasVPCs = Boolean(vpcs && vpcs.length > 0);
  const disableVPCSelectors = !regionSupportsVPCs || !regionHasVPCs;

  const resetVPCConfiguration = () => {
    resetFormFields({
      private_network: {
        vpc_id: null,
        subnet_id: null,
        public_access: false,
      },
    });
  };

  React.useEffect(() => {
    // When the selected region has changed, reset VPC configuration.
    // Then switch back to default validation behavior
    if (prevRegionId.current && prevRegionId.current !== selectedRegionId) {
      resetVPCConfiguration();
      onConfigurationChange(null);
    }
    prevRegionId.current = selectedRegionId;
  }, [selectedRegionId]);

  const vpcHelperTextCopy = !selectedRegionId
    ? 'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.'
    : 'No VPC is available in the selected region.';

  /** Returns dynamic marginTop value used to center TooltipIcon in different scenarios */
  const getVPCTooltipIconMargin = () => {
    const margins = {
      longHelperText: '.75rem',
      shortHelperText: '1.75rem',
      noHelperText: '2.75rem',
    };
    if (disableVPCSelectors && !selectedRegionId) return margins.longHelperText;
    if (disableVPCSelectors && selectedRegionId) return margins.shortHelperText;
    return margins.noHelperText;
  };

  return (
    <>
      <Typography
        sx={(theme: Theme) => ({
          marginTop: theme.spacingFunction(20),
          marginBottom: theme.spacingFunction(4),
        })}
        variant="h3"
      >
        Assign a VPC
      </Typography>

      <Typography>Assign this cluster to an existing VPC.</Typography>
      <Box style={{ display: 'flex' }}>
        <Autocomplete
          data-testid="database-vpc-selector"
          disabled={disableVPCSelectors}
          errorText={error?.[0].reason}
          helperText={disableVPCSelectors ? vpcHelperTextCopy : undefined}
          label="VPC"
          loading={isLoading}
          noOptionsText="There are no VPCs in the selected region."
          onChange={(e, value) => {
            if (!value) {
              onChange('private_network.subnet_id', null);
              onChange('private_network.public_access', false);
            }
            onConfigurationChange(value ?? null);
            onChange('private_network.vpc_id', value?.id ?? null);
          }}
          options={vpcs ?? []}
          placeholder="Select a VPC"
          sx={{ width: '354px' }}
          value={selectedVPC ?? null}
        />
        <TooltipIcon
          status="help"
          sxTooltipIcon={{
            marginTop: getVPCTooltipIconMargin(),
            padding: '0px 8px',
          }}
          text="A cluster may be assigned only to a VPC in the same region."
          tooltipPosition="top"
        />
      </Box>

      {selectedVPC ? (
        <>
          <Autocomplete
            data-testid="database-subnet-selector"
            disabled={disableVPCSelectors}
            errorText={errors?.private_network?.subnet_id}
            getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
            label="Subnet"
            onChange={(e, value) => {
              onChange('private_network.subnet_id', value?.id ?? null);
            }}
            options={selectedVPC?.subnets ?? []}
            placeholder="Select a subnet"
            value={selectedSubnet ?? null}
          />
          <Box
            sx={(theme: Theme) => ({
              marginTop: theme.spacingFunction(20),
            })}
          >
            <Checkbox
              checked={privateNetworkValues.public_access ?? false}
              data-testid="database-public-access-checkbox"
              onChange={(e, value) => {
                onChange('private_network.public_access', value ?? null);
              }}
              text={'Enable public access'}
              toolTipText={
                'Adds a public endpoint to the database in addition to the private VPC endpoint.'
              }
            />
          </Box>
        </>
      ) : (
        <Notice
          sx={(theme: Theme) => ({
            marginTop: theme.spacingFunction(20),
          })}
          text="The cluster will have public access by default if a VPC is not assigned."
          variant="info"
        />
      )}
    </>
  );
};
