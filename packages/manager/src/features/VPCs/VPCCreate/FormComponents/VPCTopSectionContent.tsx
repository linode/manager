import { useAccount } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Box,
  FormControlLabel,
  Notice,
  Stack,
  styled,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { Radio, RadioGroup } from '@linode/ui';
import {
  getQueryParamsFromQueryString,
  isFeatureEnabledV2,
} from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
// eslint-disable-next-line no-restricted-imports
import { useLocation } from 'react-router-dom';

import { Code } from 'src/components/Code/Code';
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

  const {
    control,
    formState: { errors },
  } = useFormContext<CreateVPCPayload>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'ipv6',
  });

  const isDualStackSelected = fields.some((f) => f.range);

  const { data: account } = useAccount();
  const isDualStackEnabled = isFeatureEnabledV2(
    'VPC Dual Stack',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

  const isEnterpriseCustomer = isFeatureEnabledV2(
    'VPC IPv6 Large Prefixes',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

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
      {isDualStackEnabled && (
        <Box marginTop={2}>
          <FormLabel>Networking IP Stack </FormLabel>
          <RadioGroup sx={{ display: 'block' }}>
            <Grid container spacing={2}>
              <SelectionCard
                checked={!isDualStackSelected}
                gridSize={{
                  md: 3,
                  sm: 12,
                  xs: 12,
                }}
                heading="IPv4"
                onClick={() => {
                  remove(0);
                }}
                renderIcon={() => <Radio checked={!isDualStackSelected} />}
                renderVariant={() => (
                  <TooltipIcon
                    status="info"
                    sxTooltipIcon={{
                      padding: '8px',
                    }}
                    text={
                      <Typography>
                        The VPC uses IPv4 addresses only. The VPC can use the
                        entire RFC 1918 specified range for subnetting.
                      </Typography>
                    }
                    width={250}
                  />
                )}
                subheadings={[]}
                sxCardBase={{ gap: 0 }}
                sxCardBaseIcon={{ svg: { fontSize: '20px' } }}
              />
              <SelectionCard
                checked={isDualStackSelected}
                gridSize={{
                  md: 3,
                  sm: 12,
                  xs: 12,
                }}
                heading="IPv4 + IPv6 (Dual Stack)"
                onClick={() => {
                  if (fields.length === 0) {
                    append({
                      range: '/52',
                    });
                  }
                }}
                renderIcon={() => <Radio checked={isDualStackSelected} />}
                renderVariant={() => (
                  <TooltipIcon
                    status="info"
                    sxTooltipIcon={{
                      padding: '8px',
                    }}
                    text={
                      <Stack spacing={2}>
                        <Typography>
                          The VPC supports both IPv4 and IPv6 addresses.
                        </Typography>
                        <Typography>
                          For IPv4, the VPC can use the entire RFC 1918
                          specified range for subnetting.
                        </Typography>
                        <Typography>
                          For IPv6, the VPC is assigned an IPv6 prefix length of{' '}
                          <Code>/52</Code> by default.
                        </Typography>
                      </Stack>
                    }
                    width={250}
                  />
                )}
                subheadings={[]}
                sxCardBase={{ gap: 0 }}
                sxCardBaseIcon={{ svg: { fontSize: '20px' } }}
              />
            </Grid>
          </RadioGroup>
        </Box>
      )}
      {isDualStackSelected && isEnterpriseCustomer && (
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
              <StyledFormLabel sx={{ marginTop: 1, marginBottom: 0 }}>
                VPC IPv6 Prefix Length
              </StyledFormLabel>
              {errors.ipv6 && (
                <Notice
                  sx={{ marginTop: 1 }}
                  text={errors.ipv6[0]?.range?.message}
                  variant="error"
                />
              )}
              <>
                <FormControlLabel control={<Radio />} label="/52" value="/52" />
                <FormControlLabel control={<Radio />} label="/48" value="/48" />
              </>
            </RadioGroup>
          )}
        />
      )}
    </>
  );
};

const StyledFormLabel = styled(FormLabel)(() => ({
  alignItems: 'center',
  display: 'flex',
}));
