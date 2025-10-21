import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  BetaChip,
  Box,
  Checkbox,
  FormHelperText,
  Notice,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MANAGE_NETWORKING_LEARN_MORE_LINK } from 'src/features/Databases/constants';
import { useFlags } from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { VPC } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface DatabaseVPCSelectorProps {
  onChange: (selectedVPC: null | VPC) => void;
}

export const DatabaseVPCSelector = (props: DatabaseVPCSelectorProps) => {
  const { onChange } = props;
  const flags = useFlags();
  const { control, setValue } = useFormContext<DatabaseCreateValues>();

  const [region, vpcId, subnetId] = useWatch({
    control,
    name: ['region', 'private_network.vpc_id', 'private_network.subnet_id'],
  });

  const { data: selectedRegion } = useRegionQuery(region);
  const regionSupportsVPCs = selectedRegion?.capabilities.includes('VPCs');

  const {
    data: vpcs,
    error: vpcsError,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region },
  });

  const vpcErrorMessage =
    vpcsError &&
    getAPIErrorOrDefault(vpcsError, 'Unable to load VPCs')[0].reason;

  const selectedVPC = vpcs?.find((vpc) => vpc.id === vpcId);

  const selectedSubnet = selectedVPC?.subnets.find(
    (subnet) => subnet.id === subnetId
  );

  const regionHasVPCs = Boolean(vpcs && vpcs.length > 0);
  const disableVPCSelectors =
    !!vpcsError || !regionSupportsVPCs || !regionHasVPCs;

  const vpcHelperTextCopy = !region
    ? 'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.'
    : 'No VPC is available in the selected region.';

  return (
    <>
      <Box
        sx={(theme: Theme) => ({
          display: 'flex',
          marginTop: theme.spacingFunction(20),
          marginBottom: theme.spacingFunction(4),
        })}
      >
        <Typography variant="h3">Assign a VPC</Typography>
        {flags.databaseVpcBeta && <BetaChip />}
      </Box>
      <Typography>
        Assign this cluster to an existing VPC.{' '}
        <Link
          to={`${MANAGE_NETWORKING_LEARN_MORE_LINK + (flags.databaseVpcBeta ? '-beta' : '')}`}
        >
          Learn more.
        </Link>
      </Typography>
      <Box display="flex">
        <Controller
          control={control}
          name="private_network.vpc_id"
          render={({ field, fieldState }) => (
            <Autocomplete
              data-testid="database-vpc-selector"
              disabled={disableVPCSelectors}
              errorText={vpcErrorMessage || fieldState.error?.message}
              helperText={disableVPCSelectors ? vpcHelperTextCopy : undefined}
              label="VPC"
              loading={isLoading}
              noOptionsText="There are no VPCs in the selected region."
              onChange={(e, value) => {
                setValue('private_network.subnet_id', null); // Always reset subnet selection when VPC changes
                if (!value) {
                  setValue('private_network.public_access', false);
                }
                onChange(value ?? null); // Update VPC in DatabaseCreate.tsx
                field.onChange(value?.id ?? null);
              }}
              options={vpcs ?? []}
              placeholder="Select a VPC"
              sx={{ width: '390px' }}
              textFieldProps={{
                tooltipText:
                  'A cluster may be assigned only to a VPC in the same region',
              }}
              value={selectedVPC ?? null}
            />
          )}
        />
      </Box>
      {selectedVPC ? (
        <>
          <Controller
            control={control}
            name="private_network.subnet_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                data-testid="database-subnet-selector"
                disabled={disableVPCSelectors}
                errorText={fieldState.error?.message}
                getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
                label="Subnet"
                onChange={(e, value) => {
                  field.onChange(value?.id ?? null);
                }}
                options={selectedVPC?.subnets ?? []}
                placeholder="Select a subnet"
                value={selectedSubnet ?? null}
              />
            )}
          />
          <Box
            sx={(theme: Theme) => ({
              marginTop: theme.spacingFunction(20),
            })}
          >
            <Controller
              control={control}
              name="private_network.public_access"
              render={({ field, fieldState }) => (
                <>
                  <Checkbox
                    checked={field.value}
                    data-testid="database-public-access-checkbox"
                    onChange={(e, value) => {
                      field.onChange(value ?? null);
                    }}
                    text={'Enable public access'}
                    toolTipText={
                      'Adds a public endpoint to the database in addition to the private VPC endpoint.'
                    }
                  />
                  {fieldState.error?.message && (
                    <FormHelperText
                      className="error-for-scroll"
                      error
                      role="alert"
                      sx={{ marginTop: 0 }}
                    >
                      {fieldState.error?.message}
                    </FormHelperText>
                  )}
                </>
              )}
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
