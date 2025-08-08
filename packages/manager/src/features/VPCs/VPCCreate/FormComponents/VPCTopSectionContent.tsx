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
import Grid from '@mui/material/Grid';
import * as React from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { Code } from 'src/components/Code/Code';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useGetLinodeCreateType } from 'src/features/Linodes/LinodeCreate/Tabs/utils/useGetLinodeCreateType';
import { useFlags } from 'src/hooks/useFlags';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPC_CREATE_FORM_VPC_HELPER_TEXT } from '../../constants';
import { StyledBodyTypography } from './VPCCreateForm.styles';

import type { Region } from '@linode/api-v4';
import type { CreateVPCPayload } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  regions: Region[];
}

export const VPCTopSectionContent = (props: Props) => {
  const { disabled, isDrawer, regions } = props;
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const createType = useGetLinodeCreateType();

  const {
    control,
    formState: { errors },
  } = useFormContext<CreateVPCPayload>();

  const { update } = useFieldArray({
    control,
    name: 'subnets',
  });

  const subnets = useWatch({ control, name: 'subnets' });
  const vpcIPv6 = useWatch({ control, name: 'ipv6' });

  const { isDualStackEnabled, isDualStackSelected, isEnterpriseCustomer } =
    useVPCDualStack(vpcIPv6);

  return (
    <>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_VPC_HELPER_TEXT}{' '}
        <Link
          onClick={() =>
            isFromLinodeCreate &&
            sendLinodeCreateFormInputEvent({
              createType: createType ?? 'OS',
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
          <Controller
            control={control}
            name="ipv6"
            render={({ field }) => (
              <RadioGroup sx={{ display: 'block' }}>
                <Grid container spacing={2}>
                  <SelectionCard
                    checked={!isDualStackSelected}
                    gridSize={{
                      md: isDrawer ? 12 : 3,
                      sm: 12,
                      xs: 12,
                    }}
                    heading="IPv4"
                    onClick={() => {
                      field.onChange([]);
                      subnets?.forEach((subnet, idx) =>
                        update(idx, {
                          ...subnet,
                          ipv6: undefined,
                        })
                      );
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
                            The VPC uses IPv4 addresses only. The VPC can use
                            the entire RFC 1918 specified range for subnetting.
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
                      md: isDrawer ? 12 : 3,
                      sm: 12,
                      xs: 12,
                    }}
                    heading="IPv4 + IPv6 (Dual Stack)"
                    onClick={() => {
                      field.onChange([
                        {
                          range: '/52',
                        },
                      ]);
                      subnets?.forEach((subnet, idx) =>
                        update(idx, {
                          ...subnet,
                          ipv6: subnet.ipv6 ?? [{ range: '/56' }],
                        })
                      );
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
                              For IPv6, the VPC is assigned an IPv6 prefix
                              length of <Code>/52</Code> by default.
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
            )}
          />
        </Box>
      )}
      {isDualStackSelected && isEnterpriseCustomer && (
        <Controller
          control={control}
          name="ipv6"
          render={({ field, fieldState }) => (
            <RadioGroup
              onChange={(_, value) => field.onChange([{ range: value }])}
              value={field.value}
            >
              <StyledFormLabel sx={{ marginTop: 1, marginBottom: 0 }}>
                VPC IPv6 Prefix Length
              </StyledFormLabel>
              {errors.ipv6 && (
                <Notice
                  sx={{ marginTop: 1 }}
                  text={fieldState.error?.message}
                  variant="error"
                />
              )}
              <>
                <FormControlLabel
                  checked={vpcIPv6 && vpcIPv6[0].range === '/52'}
                  control={<Radio />}
                  label="/52"
                  value="/52"
                />
                <FormControlLabel
                  checked={vpcIPv6 && vpcIPv6[0].range === '/48'}
                  control={<Radio />}
                  label="/48"
                  value="/48"
                />
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
