import { Icon, Select, Tooltip } from '@akamai/cds-components/react';
import styled from '@emotion/styled';
import { useAllNATGatewaysQuery } from '@linode/queries';
import * as React from 'react';

import type { NATGateway } from '@linode/api-v4';

interface Props {
  /**
   * ID of the subnet currently being edited.
   * Used to allow its already-assigned NAT Gateway to remain selectable.
   */
  currentSubnetId?: number;

  /**
   * Pendo ID for select options
   */
  dataPendoIdForOption?: string;

  /**
   * Pendo ID for select
   */
  dataPendoIdForSelect?: string;

  /**
   * Whether the NAT Gateway Select is disabled by the parent.
   */
  disabled?: boolean;

  /**
   * Validation error passed from the parent form.
   */
  errorText?: string;

  /**
   * Interfaces belonging to an existing subnet.
   *
   * NAT Gateway assignment is disabled when any interface
   * has a non-zero config_id.
   */
  interfaces?: Array<{
    active: boolean;
    config_id: null | number;
    id: number;
  }>;

  /**
   * Whether dependent data required by the parent is loading.
   */
  loading?: boolean;

  /**
   * Called when the selected NAT Gateway changes.
   */
  onChange: (natGatewayId: null | number) => void;

  /**
   * VPC region used to determine available NAT Gateways.
   */
  region?: string;

  /**
   * Currently selected NAT Gateway ID.
   */
  value: null | number;
}

const INFO_TOOLTIP_TEXT =
  'Route outbound internet traffic from this subnet to the public internet. ' +
  'When you attach a NAT Gateway, the system automatically assigns sequential ' +
  'outbound port ranges to all Linodes within the subnet.';

const LEGACY_INTERFACE_TOOLTIP =
  'NAT Gateway cannot be assigned to subnets with legacy network interfaces. ' +
  'Please migrate to VPC-native interfaces first.';

const REGION_TOOLTIP = 'Select a region first to enable NAT Gateway selection.';

export const NATGatewaySelect = React.memo((props: Props) => {
  const {
    currentSubnetId,
    disabled = false,
    errorText,
    interfaces,
    loading = false,
    onChange,
    region,
    value,
  } = props;

  /**
   * A subnet using any legacy interface cannot have
   * a NAT Gateway assigned.
   */
  const hasLegacyInterface = React.useMemo(
    () =>
      interfaces?.some(
        (networkInterface) =>
          networkInterface.config_id !== null &&
          networkInterface.config_id !== 0
      ) ?? false,
    [interfaces]
  );

  /**
   * Don't fetch NAT Gateways until the VPC region is known.
   */
  const { data: natGateways, isLoading: isLoadingNATGateways } =
    useAllNATGatewaysQuery({
      enabled: Boolean(region) && !loading,
    });

  /**
   * Only NAT Gateways in the selected VPC region are displayed.
   *
   * A gateway assigned to a different subnet remains visible,
   * but cannot be selected.
   *
   * When editing a subnet, the NAT Gateway currently assigned
   * to that subnet remains selectable.
   */
  const items = React.useMemo<NATGateway[]>(() => {
    if (!natGateways || !region) {
      return [];
    }

    return natGateways.filter((natGateway) => {
      // Must belong to the selected VPC region.
      if (natGateway.region !== region) {
        return false;
      }

      // Unassigned NAT Gateways are available.
      if (natGateway.vpc_subnet === null) {
        return true;
      }

      // When editing a subnet, keep its currently assigned
      // NAT Gateway available.
      return natGateway.vpc_subnet.id === currentSubnetId;
    });
  }, [currentSubnetId, natGateways, region]);

  /**
   * Resolve the API/form value back to the CDS Select item.
   */
  const selectedItem = React.useMemo(() => {
    if (value === null) {
      return null;
    }

    return items.find((item) => item.id === value) ?? null;
  }, [items, value]);

  const isLoading = loading || isLoadingNATGateways;

  /**
   * Whole-select disabled rules.
   *
   */
  const isDisabled = disabled || !region || hasLegacyInterface || isLoading;

  const disabledReason = React.useMemo(() => {
    if (hasLegacyInterface) {
      return LEGACY_INTERFACE_TOOLTIP;
    }

    if (!region) {
      return REGION_TOOLTIP;
    }

    return undefined;
  }, [hasLegacyInterface, region]);

  /**
   * Clear an invalid selection when the selected region changes.
   *
   * Example:
   * us-east + NAT Gateway 41
   *          ↓
   * region changes to us-west
   *          ↓
   * NAT Gateway 41 is no longer valid
   *          ↓
   * clear form value
   */
  React.useEffect(() => {
    if (value === null || !region || isLoadingNATGateways || !natGateways) {
      return;
    }

    const selectedGateway = items.find((item) => item.id === value);

    if (!selectedGateway) {
      onChange(null);
    }
  }, [isLoadingNATGateways, items, natGateways, onChange, region, value]);

  const handleChange = React.useCallback(
    (event: CustomEvent<NATGateway | null>) => {
      const selectedValue = event.detail;

      onChange(selectedValue?.id ?? null);
    },
    [onChange]
  );

  /**
   * CDS Select uses this to identify/compare items.
   */
  const valueFn = React.useCallback(
    (item: NATGateway) => item.id.toString(),
    []
  );

  /**
   * Custom dropdown rendering.
   *
   * disabledFn prevents selection.
   * Tooltip explains why the individual gateway is disabled.
   */
  const itemTemplateFn = React.useCallback(
    (item: NATGateway) => (
      <span data-pendo-id={props.dataPendoIdForOption ?? ''}>{item.label}</span>
    ),
    []
  );

  /**
   * Rendering for the selected value when the dropdown is closed.
   */
  const selectedItemTemplateFn = React.useCallback(
    (item: NATGateway) => <span>{item.label}</span>,
    []
  );

  const select = (
    <Select<NATGateway>
      clearable
      data-pendo-id={props.dataPendoIdForSelect ?? ''}
      disabled={isDisabled}
      error={Boolean(errorText)}
      errorMessage={errorText ?? ''}
      isLoading={isLoading}
      items={items}
      itemTemplateFn={itemTemplateFn}
      noItemsLabel="No NAT Gateways available in this region"
      onChange={handleChange}
      placeholder="Select a NAT Gateway"
      selected={selectedItem}
      selectedItemTemplateFn={selectedItemTemplateFn}
      valueFn={valueFn}
    />
  );

  return (
    <Container>
      <StyledLabel>NAT Gateway</StyledLabel>

      <ControlRow>
        <SelectContainer>
          {disabledReason ? (
            <Tooltip
              style={{ width: '100%' }}
              tooltipPlacement="top"
              tooltipText={disabledReason}
            >
              <TooltipTarget>{select}</TooltipTarget>
            </Tooltip>
          ) : (
            select
          )}
        </SelectContainer>

        <InfoTooltipContainer>
          <Tooltip tooltipPlacement="right" tooltipText={INFO_TOOLTIP_TEXT}>
            <Icon icon="info-outline" size="m" />
          </Tooltip>
        </InfoTooltipContainer>
      </ControlRow>
    </Container>
  );
});

NATGatewaySelect.displayName = 'NATGatewaySelect';

const Container = styled('div')({
  marginBottom: '16px',
  marginTop: '16px',
});

const StyledLabel = styled('label')({
  color: 'var(--token-alias-content-text-primary-default)',
  display: 'block',
  font: 'var(--token-alias-typography-body-bold)',
  lineHeight: '20px',
  marginBottom: '8px',
});

const ControlRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  gap: '8px',
});

const SelectContainer = styled('div')({
  flex: 1,
  maxWidth: '460px',
  minWidth: 0,
});

const InfoTooltipContainer = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
});

const TooltipTarget = styled('div')({
  width: '100%',
});
