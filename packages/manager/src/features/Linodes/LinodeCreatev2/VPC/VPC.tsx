import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Divider } from 'src/components/Divider';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { VPCSelect } from 'src/components/VPCSelect';
import { VPC_AUTO_ASSIGN_IPV4_TOOLTIP } from 'src/features/VPCs/constants';
import { inputMaxWidth } from 'src/foundations/themes/light';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useVPCQuery, useVPCsQuery } from 'src/queries/vpcs/vpcs';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';

import { REGION_CAVEAT_HELPER_TEXT } from '../../LinodesCreate/constants';
import { VPCCreateDrawer } from '../../LinodesCreate/VPCCreateDrawer';
import { VPCRanges } from './VPCRanges';

import type { CreateLinodeRequest } from '@linode/api-v4';

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

  const { data: selectedVPC } = useVPCQuery(
    selectedVPCId ?? -1,
    Boolean(selectedVPCId)
  );

  // This is here only to determine which copy to show...
  const { data } = useVPCsQuery({}, { region: regionId }, regionSupportsVPCs);

  const copy =
    data?.results === 0
      ? 'Allow Linode to communicate in an isolated environment.'
      : 'Assign this Linode to an existing VPC.';

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">VPC</Typography>
        <Typography>
          {copy}{' '}
          <Link to="https://www.linode.com/docs/products/networking/vpc/guides/assign-services/">
            Learn more.
          </Link>
        </Typography>
        <Stack spacing={1.5}>
          <Controller
            render={({ field, fieldState }) => (
              <VPCSelect
                helperText={
                  regionId && !regionSupportsVPCs
                    ? 'VPC is not available in the selected region.'
                    : undefined
                }
                textFieldProps={{
                  sx: (theme) => ({
                    [theme.breakpoints.up('sm')]: { minWidth: inputMaxWidth },
                  }),
                  tooltipText: REGION_CAVEAT_HELPER_TEXT,
                }}
                disabled={!regionSupportsVPCs}
                errorText={fieldState.error?.message}
                filter={{ region: regionId }}
                label="Assign VPC"
                noMarginTop
                onBlur={field.onBlur}
                onChange={(e, vpc) => field.onChange(vpc?.id ?? null)}
                placeholder="None"
                value={field.value ?? null}
              />
            )}
            control={control}
            name="interfaces.0.vpc_id"
          />
          {regionId && regionSupportsVPCs && (
            <Box>
              <LinkButton onClick={() => setIsCreateDrawerOpen(true)}>
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
                  <Typography fontFamily={(theme) => theme.font.bold}>
                    Assign additional IPv4 ranges
                  </Typography>
                  {formState.errors.interfaces?.[1]?.ip_ranges?.message && (
                    <Notice
                      text={formState.errors.interfaces[1]?.ip_ranges?.message}
                      variant="error"
                    />
                  )}
                  <Typography>
                    Assign additional IPv4 address ranges that the VPC can use
                    to reach services running on this Linode.{' '}
                    <Link to="https://www.linode.com/docs/products/networking/vpc/guides/assign-services/">
                      Learn more
                    </Link>
                    .
                  </Typography>
                  {formState.errors.interfaces?.[0]?.ip_ranges?.message && (
                    <Notice
                      text={formState.errors.interfaces[0]?.ip_ranges?.message}
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
        handleSelectVPC={(vpcId) => setValue('interfaces.0.vpc_id', vpcId)}
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
        selectedRegion={regionId}
      />
    </Paper>
  );
};
