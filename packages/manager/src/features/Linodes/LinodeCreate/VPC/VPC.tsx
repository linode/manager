import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Notice,
  Paper,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { VPCPublicIPLabel } from 'src/features/VPCs/components/VPCPublicIPLabel';
import { VPCRangesDescription } from 'src/features/VPCs/components/VPCRangesDescription';
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPCAvailabilityNotice } from '../Networking/VPCAvailabilityNotice';
import { useLinodeCreateQueryParams } from '../utilities';
import { VPCRanges } from './VPCRanges';

import type { LinodeCreateFormValues } from '../utilities';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

export const VPC = () => {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const { control, formState, setValue } =
    useFormContext<LinodeCreateFormValues>();

  const [regionId, selectedVPCId, selectedSubnetId, linodeVPCIPAddress] =
    useWatch({
      control,
      name: [
        'region',
        'interfaces.0.vpc_id',
        'interfaces.0.subnet_id',
        'interfaces.0.ipv4.vpc',
      ],
    });

  const { data: region } = useRegionQuery(regionId);

  const regionSupportsVPCs = region?.capabilities.includes('VPCs') ?? false;

  const {
    data: vpcs,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: regionId },
  });

  const selectedVPC = vpcs?.find((vpc) => vpc.id === selectedVPCId);

  const copy =
    vpcs?.length === 0
      ? 'Allow Linode to communicate in an isolated environment.'
      : 'Assign this Linode to an existing VPC.';

  const { params } = useLinodeCreateQueryParams();

  const vpcFormEventOptions: LinodeCreateFormEventOptions = {
    createType: params.type ?? 'OS',
    headerName: 'VPC',
    interaction: 'click',
    label: 'VPC',
  };

  return (
    <Paper data-testid="vpc-panel">
      <Stack spacing={2}>
        <Typography variant="h2">VPC</Typography>
        <Typography>
          {copy}{' '}
          <Link
            onClick={() =>
              sendLinodeCreateFormInputEvent({
                ...vpcFormEventOptions,
                label: 'Learn more',
              })
            }
            to="https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc"
          >
            Learn more.
          </Link>
        </Typography>
        {region && !regionSupportsVPCs && <VPCAvailabilityNotice />}
        <Stack spacing={1.5}>
          <Controller
            control={control}
            name="interfaces.0.vpc_id"
            render={({ field, fieldState }) => (
              <Autocomplete
                disabled={!regionSupportsVPCs}
                errorText={error?.[0].reason ?? fieldState.error?.message}
                helperText={
                  !regionId
                    ? 'Select a region to see available VPCs.'
                    : undefined
                }
                label="Assign VPC"
                loading={isLoading}
                noMarginTop
                noOptionsText="There are no VPCs in the selected region."
                onBlur={field.onBlur}
                onChange={(e, vpc) => {
                  field.onChange(vpc?.id ?? null);

                  if (vpc && vpc.subnets.length === 1) {
                    // If the user selectes a VPC and the VPC only has one subnet,
                    // preselect that subnet for the user.
                    setValue('interfaces.0.subnet_id', vpc.subnets[0].id, {
                      shouldValidate: true,
                    });
                  } else {
                    // Otherwise, just clear the selected subnet
                    setValue('interfaces.0.subnet_id', null);
                  }

                  // Capture analytics
                  if (!vpc?.id) {
                    sendLinodeCreateFormInputEvent({
                      ...vpcFormEventOptions,
                      interaction: 'clear',
                      subheaderName: 'Assign VPC',
                      trackOnce: true,
                    });
                  } else {
                    sendLinodeCreateFormInputEvent({
                      ...vpcFormEventOptions,
                      interaction: 'change',
                      subheaderName: 'Assign VPC',
                      trackOnce: true,
                    });
                  }
                }}
                options={vpcs ?? []}
                placeholder="None"
                textFieldProps={{
                  tooltipText: REGION_CAVEAT_HELPER_TEXT,
                }}
                value={selectedVPC ?? null}
              />
            )}
          />
          {regionId && regionSupportsVPCs && (
            <Box>
              <LinkButton
                onClick={() => {
                  setIsCreateDrawerOpen(true);
                  sendLinodeCreateFormInputEvent({
                    ...vpcFormEventOptions,
                    label: 'Create VPC',
                  });
                }}
              >
                Create VPC
              </LinkButton>
            </Box>
          )}
          {selectedVPCId && (
            <>
              <Controller
                control={control}
                name="interfaces.0.subnet_id"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    errorText={fieldState.error?.message}
                    getOptionLabel={(subnet) =>
                      `${subnet.label} (${subnet.ipv4})`
                    }
                    label="Subnet"
                    noMarginTop
                    onBlur={field.onBlur}
                    onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
                    options={selectedVPC?.subnets ?? []}
                    placeholder="Select Subnet"
                    value={
                      selectedVPC?.subnets.find(
                        (subnet) => subnet.id === field.value
                      ) ?? null
                    }
                  />
                )}
              />
              {selectedSubnetId && (
                <>
                  <Stack>
                    <Controller
                      control={control}
                      name="interfaces.0.ipv4.vpc"
                      render={({ field }) => (
                        <Box>
                          <FormControlLabel
                            checked={
                              field.value === null || field.value === undefined
                            }
                            control={<Checkbox sx={{ ml: 0.5 }} />}
                            label={
                              <Stack alignItems="center" direction="row">
                                <Typography>
                                  Auto-assign a VPC IPv4 address for this Linode
                                  in the VPC
                                </Typography>
                                <TooltipIcon
                                  status="help"
                                  text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
                                />
                              </Stack>
                            }
                            onChange={(e, checked) =>
                              // If "Auto-assign" is checked, set the VPC IP to null
                              // so that it gets auto-assigned. Otherwise, set it to
                              // an empty string so that the TextField renders and a
                              // user can enter one.
                              field.onChange(checked ? null : '')
                            }
                          />
                        </Box>
                      )}
                    />
                    {linodeVPCIPAddress !== null &&
                      linodeVPCIPAddress !== undefined && (
                        <Controller
                          control={control}
                          name="interfaces.0.ipv4.vpc"
                          render={({ field, fieldState }) => (
                            <TextField
                              containerProps={{ sx: { mb: 1, mt: 1 } }}
                              errorText={fieldState.error?.message}
                              label="VPC IPv4"
                              noMarginTop
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              required
                              value={field.value}
                            />
                          )}
                        />
                      )}
                    <Controller
                      control={control}
                      name="interfaces.0.ipv4.nat_1_1"
                      render={({ field }) => (
                        <FormControlLabel
                          checked={field.value === 'any'}
                          control={<Checkbox sx={{ ml: 0.5 }} />}
                          label={<VPCPublicIPLabel />}
                          onChange={(e, checked) =>
                            field.onChange(checked ? 'any' : null)
                          }
                          sx={{ mt: 0 }}
                        />
                      )}
                    />
                  </Stack>
                  <Divider />
                  <Typography sx={(theme) => ({ font: theme.font.bold })}>
                    Assign additional IPv4 ranges
                  </Typography>
                  {formState.errors.interfaces?.[1] &&
                    formState.errors.interfaces[1] &&
                    'ip_ranges' in formState.errors.interfaces[1] && (
                      <Notice
                        text={formState.errors.interfaces[1].ip_ranges?.message}
                        variant="error"
                      />
                    )}
                  <VPCRangesDescription />
                  <VPCRanges />
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
      <VPCCreateDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        onSuccess={(vpc) => {
          setValue('interfaces.0.vpc_id', vpc.id);

          if (vpc.subnets.length === 1) {
            // If the user creates a VPC with just one subnet,
            // preselect it for them
            setValue('interfaces.0.subnet_id', vpc.subnets[0].id);
          }
        }}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Paper>
  );
};
