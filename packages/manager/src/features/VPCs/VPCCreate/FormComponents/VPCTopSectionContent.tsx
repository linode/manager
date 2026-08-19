import {
  FormError,
  FormField,
  FormLabel,
  RadioButton,
  RadioGroup,
  TextArea,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useRegionsVPCAvailabilitiesQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Notice, TooltipIcon } from '@linode/ui';
import * as React from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { Code } from 'src/components/Code/Code';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useGetLinodeCreateType } from 'src/features/Linodes/LinodeCreate/Tabs/utils/useGetLinodeCreateType';
import { useFlags } from 'src/hooks/useFlags';
import { useIsGpuRdmaPlanEnabled } from 'src/hooks/useIsGpuRdmaPlanEnabled';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPCIPv4Ranges } from '../../components/VPCIPv4Ranges';
import {
  RFC1918HelperText,
  VPC_CREATE_FORM_VPC_HELPER_TEXT,
} from '../../constants';
import { useIsCustomVPCIPv4RangesEnabled } from '../../utils';
import { StyledBodyTypography } from './VPCCreateForm.styles';

import type { Region, VPCType } from '@linode/api-v4';
import type { CreateVPCPayload } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  regions: Region[];
}

interface RadioButtonContainerProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  testId: string;
  toolTipText?: React.ReactElement | string;
  toolTipWidth?: number;
  value: string;
}

const RadioButtonContainer = (props: RadioButtonContainerProps) => {
  const { checked, disabled, testId, value, label, toolTipText, toolTipWidth } =
    props;
  return (
    <div style={{ alignItems: 'flex-start', display: 'flex' }}>
      <RadioButton
        checked={checked}
        data-testid={testId}
        disabled={disabled}
        style={{
          padding: `${Spacing.S8} 0`,
          marginRight: '0px',
          marginLeft: '0px',
        }}
        value={value}
      />
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: Spacing.S4,
          marginTop: Spacing.S12,
        }}
      >
        <div>{label}</div>
        {toolTipText && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{ p: 0 }}
            text={toolTipText}
            tooltipPosition="right"
            width={toolTipWidth}
          />
        )}
      </div>
    </div>
  );
};

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
    getValues,
    setValue,
    trigger,
  } = useFormContext<CreateVPCPayload>();

  const { update } = useFieldArray({
    control,
    name: 'subnets',
  });

  const [subnets, vpcIPv6, regionId, vpcType] = useWatch({
    control,
    name: ['subnets', 'ipv6', 'region', 'vpc_type'],
  });

  const { data: permissions } = usePermissions('account', ['create_vpc']);

  const { isDualStackEnabled, isDualStackSelected } = useVPCDualStack(vpcIPv6);
  const isRDMAVPCTypeSelected = vpcType === 'rdma';

  const { isGpuRdmaPlanEnabled } = useIsGpuRdmaPlanEnabled();

  const { isCustomVPCIPv4RangesEnabled } = useIsCustomVPCIPv4RangesEnabled();

  const { data: regionsVPCAvailabilities } =
    useRegionsVPCAvailabilitiesQuery(isDualStackEnabled);

  const availableRegionIPv6PrefixLengths = regionsVPCAvailabilities?.find(
    (region) => region.region === regionId
  )?.available_ipv6_prefix_lengths;

  React.useEffect(() => {
    if (!isRDMAVPCTypeSelected || !isDualStackSelected) {
      return;
    }

    // RDMA VPC type supports IPv4-only in the create flow.
    setValue('ipv6', []);
    const currentSubnets = getValues('subnets');
    currentSubnets?.forEach((subnet, idx) => {
      if (subnet.ipv6 !== undefined) {
        update(idx, {
          ...subnet,
          ipv6: undefined,
        });
      }
    });
  }, [isDualStackSelected, isRDMAVPCTypeSelected, getValues, setValue, update]);

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
            sx={{ mb: Spacing.S12 }}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="label"
        render={({ field, fieldState }) => (
          <FormField
            aria-label="Enter a label"
            error={Boolean(fieldState.error?.message)}
            labelPosition="top"
          >
            <FormLabel
              htmlFor="label"
              slot="label"
              style={{
                textAlign: 'left',
                padding: Spacing.S0,
                marginBottom: Spacing.S8,
              }}
            >
              VPC Label
            </FormLabel>
            <TextField
              aria-label="VPC Label"
              disabled={disabled}
              error={Boolean(fieldState.error?.message)}
              id="label"
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              style={{ boxSizing: 'border-box', maxWidth: '416px' }}
              value={field.value}
            />
            {Boolean(fieldState.error?.message) && (
              <FormError slot="error">{fieldState.error?.message}</FormError>
            )}
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField
            annotation="optional"
            aria-label="Enter a description"
            error={Boolean(fieldState.error?.message)}
            labelPosition="top"
          >
            <FormLabel
              htmlFor="description"
              slot="label"
              style={{
                textAlign: 'left',
                padding: Spacing.S0,
                marginBottom: Spacing.S8,
              }}
            >
              Description
            </FormLabel>
            <TextArea
              aria-label="Description"
              disabled={disabled}
              error={Boolean(fieldState.error?.message)}
              id="description"
              onBlur={field.onBlur}
              onChange={field.onChange}
              style={{ boxSizing: 'border-box', maxWidth: '416px' }}
              value={field.value}
            />
            {Boolean(fieldState.error?.message) && (
              <FormError slot="error">{fieldState.error?.message}</FormError>
            )}
          </FormField>
        )}
      />
      {isGpuRdmaPlanEnabled && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: Spacing.S12,
            paddingBottom: Spacing.S12,
          }}
        >
          <Controller
            control={control}
            name="vpc_type"
            render={({ field }) => (
              <RadioGroup
                aria-label="VPC Type"
                onChange={(e: CustomEvent) =>
                  field.onChange(e.detail.value as VPCType)
                }
                value={field.value ?? 'regular'}
              >
                <FormLabel
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  VPC Type
                </FormLabel>
                <RadioButtonContainer
                  checked={(field.value ?? 'regular') === 'regular'}
                  disabled={disabled}
                  label="Regular"
                  testId="vpc-type-regular-radio"
                  toolTipText="Standard VPC environment for traditional network interfaces and general application traffic."
                  value="regular"
                />
                <RadioButtonContainer
                  checked={field.value === 'rdma'}
                  disabled={disabled}
                  label="RDMA"
                  testId="vpc-type-rdma-radio"
                  toolTipText="Specialized VPC for RDMA interfaces, optimized for direct device-to-device communication using RDMA."
                  value="rdma"
                />
              </RadioGroup>
            )}
          />
        </div>
      )}
      {isDualStackEnabled && (
        <div style={{ paddingTop: Spacing.S12, paddingBottom: Spacing.S12 }}>
          <FormLabel>IP Stack</FormLabel>
          <Controller
            control={control}
            name="ipv6"
            render={({ field }) => (
              <RadioGroup
                aria-label="IP Stack"
                onChange={(e: CustomEvent) => {
                  if (e.detail.value === 'ipv4') {
                    field.onChange([]);
                    subnets?.forEach((subnet, idx) =>
                      update(idx, {
                        ...subnet,
                        ipv6: undefined,
                      })
                    );
                  } else {
                    field.onChange([{ range: '/52' }]);
                    subnets?.forEach((subnet, idx) =>
                      update(idx, {
                        ...subnet,
                        ipv6: subnet.ipv6 ?? [{ range: '/56' }],
                      })
                    );
                  }
                }}
                value={isDualStackSelected ? 'dual-stack' : 'ipv4'}
              >
                <RadioButtonContainer
                  checked={!isDualStackSelected}
                  disabled={!permissions?.create_vpc}
                  label="IPv4"
                  testId="ip-stack-ipv4-radio"
                  toolTipText={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: Spacing.S16,
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        The VPC uses IPv4 addresses only.
                      </p>
                      <p style={{ margin: 0 }}>{RFC1918HelperText}</p>
                    </div>
                  }
                  toolTipWidth={250}
                  value="ipv4"
                />
                {!isRDMAVPCTypeSelected &&
                  availableRegionIPv6PrefixLengths &&
                  availableRegionIPv6PrefixLengths.length > 0 && (
                    <RadioButtonContainer
                      checked={isDualStackSelected}
                      disabled={!permissions?.create_vpc}
                      label="IPv4 + IPv6 (Dual Stack)"
                      testId="ip-stack-dual-stack-radio"
                      toolTipText={
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: Spacing.S16,
                          }}
                        >
                          <p style={{ margin: 0 }}>
                            The VPC supports both IPv4 and IPv6 addresses.
                          </p>
                          <p style={{ margin: 0 }}>
                            For IPv4, {RFC1918HelperText}
                          </p>
                          <p style={{ margin: 0 }}>
                            For IPv6, the VPC is assigned an IPv6 prefix length
                            of <Code>/52</Code> by default.
                          </p>
                        </div>
                      }
                      toolTipWidth={280}
                      value="dual-stack"
                    />
                  )}
              </RadioGroup>
            )}
          />
        </div>
      )}
      {!isRDMAVPCTypeSelected &&
        isDualStackSelected &&
        availableRegionIPv6PrefixLengths &&
        availableRegionIPv6PrefixLengths.length > 1 && ( // Hide /52 if it's the only prefix length
          <div
            style={{
              paddingTop: Spacing.S12,
              paddingBottom: Spacing.S12,
            }}
          >
            <Controller
              control={control}
              name="ipv6"
              render={({ field, fieldState }) => (
                <RadioGroup
                  aria-label="VPC IPv6 Prefix Length"
                  onChange={(e: CustomEvent) =>
                    field.onChange([{ range: e.detail.value }])
                  }
                  value={field.value?.[0]?.range ?? ''}
                >
                  <FormLabel
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    VPC IPv6 Prefix Length
                  </FormLabel>
                  {errors.ipv6 && (
                    <Notice
                      sx={{ marginTop: 1 }}
                      text={fieldState.error?.message}
                      variant="error"
                    />
                  )}
                  {availableRegionIPv6PrefixLengths.map((prefixLength) => (
                    <RadioButtonContainer
                      checked={field.value?.[0]?.range === `/${prefixLength}`}
                      disabled={!permissions?.create_vpc}
                      key={prefixLength}
                      label={`/${prefixLength}`}
                      testId={`vpc-ipv6-prefix-length-${prefixLength}-radio`}
                      value={`/${prefixLength}`}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </div>
        )}
      {isCustomVPCIPv4RangesEnabled && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: Spacing.S4,
            paddingBottom: Spacing.S12,
          }}
        >
          <Controller
            control={control}
            name="ipv4"
            render={({ field, fieldState }) => (
              <VPCIPv4Ranges
                disabled={disabled}
                error={
                  typeof fieldState.error?.message === 'string'
                    ? fieldState.error.message
                    : undefined
                }
                onBlur={field.onBlur}
                onChange={(ranges) => {
                  field.onChange(ranges);
                  trigger('ipv4');
                }}
                optional
                rangeErrors={(field.value ?? []).map(
                  (_, index) => errors.ipv4?.[index]?.range?.message
                )}
                ranges={field.value ?? []}
              />
            )}
          />
        </div>
      )}
    </>
  );
};
