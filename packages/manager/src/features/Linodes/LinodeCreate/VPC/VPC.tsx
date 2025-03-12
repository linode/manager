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
import {
  REGION_CAVEAT_HELPER_TEXT,
  VPC_AUTO_ASSIGN_IPV4_TOOLTIP,
} from 'src/features/VPCs/constants';
import { VPCCreateDrawer } from 'src/features/VPCs/VPCCreateDrawer/VPCCreateDrawer';
import { useRegionsQuery, useAllVPCsQuery } from '@linode/queries';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';

import { useLinodeCreateQueryParams } from '../utilities';
import { VPCRanges } from './VPCRanges';

import type { CreateLinodeRequest } from '@linode/api-v4';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

// @TODO Linode Interfaces - need to handle case if interface is not legacy

export const VPC = () => {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const {
    control,
    formState,
    setValue,
  } = useFormContext<CreateLinodeRequest>();

  const { data: regions } = useRegionsQuery();

  const [
    regionId,
    selectedVPCId,
    selectedSubnetId,
    linodeVPCIPAddress,
  ] = useWatch({
    control,
    name: [
      'region',
      'interfaces.0.vpc_id',
      'interfaces.0.subnet_id',
      'interfaces.0.ipv4.vpc',
    ],
  });

  const regionSupportsVPCs = doesRegionSupportFeature(
    regionId,
    regions ?? [],
    'VPCs'
  );

  const { data: vpcs, error, isLoading } = useAllVPCsQuery({
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
        <Stack spacing={1.5}>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                helperText={
                  regionId && !regionSupportsVPCs
                    ? 'VPC is not available in the selected region.'
                    : undefined
                }
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
                textFieldProps={{
                  tooltipText: REGION_CAVEAT_HELPER_TEXT,
                }}
                disabled={!regionSupportsVPCs}
                errorText={error?.[0].reason ?? fieldState.error?.message}
                label="Assign VPC"
                loading={isLoading}
                noMarginTop
                onBlur={field.onBlur}
                options={vpcs ?? []}
                placeholder="None"
                value={selectedVPC ?? null}
              />
            )}
            control={control}
            name="interfaces.0.vpc_id"
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
                render={({ field, fieldState }) => (
                  <Autocomplete
                    getOptionLabel={(subnet) =>
                      `${subnet.label} (${subnet.ipv4})`
                    }
                    value={
                      selectedVPC?.subnets.find(
                        (subnet) => subnet.id === field.value
                      ) ?? null
                    }
                    errorText={fieldState.error?.message}
                    label="Subnet"
                    noMarginTop
                    onBlur={field.onBlur}
                    onChange={(e, subnet) => field.onChange(subnet?.id ?? null)}
                    options={selectedVPC?.subnets ?? []}
                    placeholder="Select Subnet"
                  />
                )}
                control={control}
                name="interfaces.0.subnet_id"
              />
              {selectedSubnetId && (
                <>
                  <Stack>
                    <Controller
                      render={({ field }) => (
                        <Box>
                          <FormControlLabel
                            checked={
                              field.value === null || field.value === undefined
                            }
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
                            control={<Checkbox sx={{ ml: 0.5 }} />}
                          />
                        </Box>
                      )}
                      control={control}
                      name="interfaces.0.ipv4.vpc"
                    />
                    {linodeVPCIPAddress !== null &&
                      linodeVPCIPAddress !== undefined && (
                        <Controller
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
                          control={control}
                          name="interfaces.0.ipv4.vpc"
                        />
                      )}
                    <Controller
                      render={({ field }) => (
                        <FormControlLabel
                          label={
                            <Stack alignItems="center" direction="row">
                              <Typography>
                                Assign a public IPv4 address for this Linode
                              </Typography>
                              <TooltipIcon
                                text={
                                  'Access the internet through the public IPv4 address using static 1:1 NAT.'
                                }
                                status="help"
                              />
                            </Stack>
                          }
                          onChange={(e, checked) =>
                            field.onChange(checked ? 'any' : null)
                          }
                          checked={field.value === 'any'}
                          control={<Checkbox sx={{ ml: 0.5 }} />}
                          sx={{ mt: 0 }}
                        />
                      )}
                      control={control}
                      name="interfaces.0.ipv4.nat_1_1"
                    />
                  </Stack>
                  <Divider />
                  <Typography sx={(theme) => ({ font: theme.font.bold })}>
                    Assign additional IPv4 ranges
                  </Typography>
                  {formState.errors.interfaces?.[1] &&
                    'ip_ranges' in formState.errors.interfaces?.[1] && (
                      <Notice
                        text={
                          formState.errors.interfaces[1]?.ip_ranges?.message
                        }
                        variant="error"
                      />
                    )}
                  <Typography>
                    Assign additional IPv4 address ranges that the VPC can use
                    to reach services running on this Linode.{' '}
                    <Link to="https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc">
                      Learn more
                    </Link>
                    .
                  </Typography>
                  {formState.errors.interfaces?.[0] &&
                    'ip_ranges' in formState.errors.interfaces[0] && (
                      <Notice
                        text={
                          formState.errors.interfaces[0]?.ip_ranges?.message
                        }
                        variant="error"
                      />
                    )}
                  <VPCRanges />
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
      <VPCCreateDrawer
        onSuccess={(vpc) => {
          setValue('interfaces.0.vpc_id', vpc.id);

          if (vpc.subnets.length === 1) {
            // If the user creates a VPC with just one subnet,
            // preselect it for them
            setValue('interfaces.0.subnet_id', vpc.subnets[0].id);
          }
        }}
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Paper>
  );
};
