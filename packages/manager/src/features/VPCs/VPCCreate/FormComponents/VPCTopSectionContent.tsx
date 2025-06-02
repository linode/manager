import { useIsGeckoEnabled } from '@linode/shared';
import { Box, FormControlLabel, TextField } from '@linode/ui';
import { Radio, RadioGroup, Typography } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// eslint-disable-next-line no-restricted-imports
import { useLocation } from 'react-router-dom';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useFlags } from 'src/hooks/useFlags';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPC_CREATE_FORM_VPC_HELPER_TEXT } from '../../constants';
import { StyledBodyTypography } from './VPCCreateForm.styles';

import type { Region } from '@linode/api-v4';
import type { CreateVPCPayload } from '@linode/api-v4';
import type { LinodeCreateType } from '@linode/utilities';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  regions: Region[];
}

export const VPCTopSectionContent = (props: Props) => {
  const { disabled, isDrawer, regions } = props;
  const location = useLocation();
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
    location.search
  );

  const [cidrOption, setCIDROption] = React.useState('ipv4');

  const { control } = useFormContext<CreateVPCPayload>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'ipv6',
  });

  return (
    <>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_VPC_HELPER_TEXT}{' '}
        <Link
          onClick={() =>
            isFromLinodeCreate &&
            sendLinodeCreateFormInputEvent({
              createType: (queryParams.type as LinodeCreateType) ?? 'OS',
              headerName: 'Create VPC',
              interaction: 'click',
              label: 'Learn more',
            })
          }
          to="https://techdocs.akamai.com/cloud-computing/docs/vpc"
        >
          Learn more
        </Link>
        .
      </StyledBodyTypography>
      <Controller
        control={control}
        name="region"
        render={({ field, fieldState }) => (
          <RegionSelect
            aria-label="Choose a region"
            currentCapability="VPCs"
            disabled={isDrawer ? true : disabled}
            errorText={fieldState.error?.message}
            isGeckoLAEnabled={isGeckoLAEnabled}
            onBlur={field.onBlur}
            onChange={(_, region) => field.onChange(region?.id ?? '')}
            regions={regions}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="label"
        render={({ field, fieldState }) => (
          <TextField
            aria-label="Enter a label"
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="VPC Label"
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Description"
            maxRows={1}
            multiline
            onBlur={field.onBlur}
            onChange={field.onChange}
            optional
            value={field.value}
          />
        )}
      />
      {flags.vpcIpv6 && (
        <Box marginTop={2}>
          <FormLabel>VPC CIDR</FormLabel>
          <Typography>
            Select the IP Addresses type. We will auto-allocate an IPv6 address
            for for you.
          </Typography>
          <RadioGroup sx={{ display: 'block' }}>
            <Grid container spacing={2}>
              <SelectionCard
                checked={cidrOption === 'ipv4'}
                gridSize={{
                  md: 3,
                  sm: 12,
                  xs: 12,
                }}
                heading="IPv4"
                onClick={() => {
                  setCIDROption('ipv4');
                  remove(0);
                }}
                renderIcon={() => <Radio checked={cidrOption === 'ipv4'} />}
                subheadings={[]}
                sxCardBaseIcon={{ svg: { fontSize: '20px' } }}
              />
              <SelectionCard
                checked={cidrOption === 'dualstack'}
                gridSize={{
                  md: 3,
                  sm: 12,
                  xs: 12,
                }}
                heading="IPv4 + IPv6 (Dual Stack)"
                onClick={() => {
                  setCIDROption('dualstack');
                  if (fields.length === 0) {
                    append({
                      range: '/52',
                    });
                  }
                }}
                renderIcon={() => (
                  <Radio checked={cidrOption === 'dualstack'} />
                )}
                subheadings={[]}
                sxCardBaseIcon={{ svg: { fontSize: '20px' } }}
              />
            </Grid>
          </RadioGroup>
        </Box>
      )}
      {flags.vpcIpv6 && (
        <>
          <FormLabel>IPv4 CIDR</FormLabel>
          <Typography>
            Lorum you will have full access to the full RFC 1918 range.
          </Typography>
        </>
      )}
      {flags.vpcIpv6 && cidrOption === 'dualstack' && (
        <Controller
          control={control}
          name="ipv6"
          render={() => (
            <RadioGroup
              onChange={(_, value) => {
                remove(0);
                append({
                  range: value,
                });
              }}
              value={fields[0].range}
            >
              <FormLabel sx={{ marginTop: 1, marginBottom: 0 }}>
                IPv6 CIDR
              </FormLabel>
              <FormControlLabel control={<Radio />} label="/52" value="/52" />
              {/* @TODO VPCIPv6: Revisit /48 and /44 options once we have something in place to determine high reputation/specific customers
              <FormControlLabel control={<Radio />} label="/48" value="/48" />
              <FormControlLabel control={<Radio />} label="/44" value="/44" /> */}
            </RadioGroup>
          )}
        />
      )}
    </>
  );
};
