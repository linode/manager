import {
  Badge,
  Checkbox,
  Icon,
  NotificationBanner,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import { Autocomplete, FormHelperText } from '@linode/ui';
import * as React from 'react';
import type { Control, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MANAGE_NETWORKING_LEARN_MORE_LINK } from 'src/features/Databases/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { PrivateNetwork, VPC } from '@linode/api-v4';

interface NetworkValues {
  private_network?: null | PrivateNetwork;
}

interface DatabaseVPCProps {
  control: Control<NetworkValues>;
  mode: 'create' | 'networking';
  onChange?: (selectedVPC: null | VPC) => void;
  region: string;
  setValue: UseFormSetValue<NetworkValues>;
  subnetId: null | number;
  trigger?: UseFormTrigger<NetworkValues>;
  vpcId: null | number;
}

export const DatabaseVPC = (props: DatabaseVPCProps) => {
  const {
    onChange,
    setValue,
    trigger,
    control,
    region,
    vpcId,
    subnetId,
    mode,
  } = props;
  const flags = useFlags();

  const { data: selectedRegion } = useRegionQuery(region);
  const regionSupportsVPCs = selectedRegion?.capabilities.includes('VPCs');

  const {
    data: vpcs,
    error: vpcsError,
    isLoading: vpcsLoading,
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
      <div
        style={{
          display: 'flex',
          marginTop: Spacing.S20,
          marginBottom: Spacing.S4,
        }}
      >
        <h4 style={{ margin: 0 }}>Assign a VPC</h4>
        {flags.databaseVpcBeta && (
          <Badge
            color="neutral"
            style={{ marginLeft: Spacing.S8 }}
            variant="solid"
          >
            BETA
          </Badge>
        )}
      </div>
      <p style={{ margin: 0 }}>
        Assign this cluster to an existing VPC.{' '}
        <Link
          to={`${MANAGE_NETWORKING_LEARN_MORE_LINK + (flags.databaseVpcBeta ? '-beta' : '')}`}
        >
          Learn more.
        </Link>
      </p>
      <div style={{ display: 'flex' }}>
        <Controller
          control={control}
          name="private_network.vpc_id"
          render={({ field, fieldState }) => (
            <Autocomplete
              autoHighlight
              data-testid="database-vpc-selector"
              disabled={disableVPCSelectors}
              disablePortal={false} // Portal must be enabled for the popper to open in a CDS Drawer
              errorText={vpcErrorMessage || fieldState.error?.message}
              helperText={disableVPCSelectors ? vpcHelperTextCopy : undefined}
              label="VPC"
              loading={vpcsLoading}
              noOptionsText="There are no VPCs in the selected region."
              onChange={(e, value) => {
                setValue('private_network.subnet_id', null); // Always reset subnet selection when VPC changes
                trigger?.('private_network.subnet_id');
                if (!value) {
                  setValue('private_network.public_access', false);
                }
                onChange?.(value ?? null); // Update VPC in DatabaseCreate.tsx
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
      </div>
      {selectedVPC ? (
        <>
          <Controller
            control={control}
            name="private_network.subnet_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                autoHighlight
                data-testid="database-subnet-selector"
                disabled={disableVPCSelectors}
                disablePortal={false} // Portal must be enabled for the popper to open in a CDS Drawer
                errorText={fieldState.error?.message}
                getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
                label="Subnet"
                onChange={(e, value) => {
                  field.onChange(value?.id ?? null);
                  trigger?.('private_network.subnet_id');
                }}
                options={selectedVPC?.subnets ?? []}
                placeholder="Select a subnet"
                value={selectedSubnet ?? null}
              />
            )}
          />
          <div style={{ marginTop: Spacing.S20 }}>
            <Controller
              control={control}
              name="private_network.public_access"
              render={({ field, fieldState }) => (
                <>
                  <Checkbox
                    checked={!!field.value}
                    data-testid="database-public-access-checkbox"
                    onChange={(e) => {
                      field.onChange(e.detail);
                    }}
                  >
                    Enable public access
                  </Checkbox>
                  <Tooltip
                    style={{ marginLeft: Spacing.S4 }}
                    tooltipPlacement="bottom"
                    tooltipText="Adds a public endpoint to the database in addition to the private VPC endpoint."
                  >
                    <Icon icon="info-outline" size="m" />
                  </Tooltip>
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
          </div>
        </>
      ) : (
        mode === 'create' && (
          <NotificationBanner
            style={{ marginTop: Spacing.S16 }}
            text="The cluster will have public access by default if a VPC is not assigned."
            type="info"
          />
        )
      )}
    </>
  );
};
