import { RadioButton, RadioGroup } from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import {
  Box,
  FormControlLabel,
  Notice,
  Paper,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { IPAddressSelection } from '../ReservedIps/IPAddressSelection/IPAddressSelection';

import type { NodeBalancerFieldsState } from './NodeBalancerCreate';
import type {
  IPAddress,
  NodeBalancerBackendConnectivity,
} from '@linode/api-v4';

interface Props {
  backendConnectivityError?: string;
  disabled?: boolean;
  frontendIPMode: 'auto' | 'reserved';
  isPremiumNodebalancerEnabled?: boolean;
  nodeBalancerFields: NodeBalancerFieldsState;
  onBackendIPModeChange: (mode: NodeBalancerBackendConnectivity) => void;
  onFrontendIPModeChange: (mode: 'auto' | 'reserved') => void;
  onReservedIPSelect: (ip: any) => void;
  reservedIPError?: string;
  reservedIPSectionRef: React.RefObject<HTMLDivElement | null>;
  selectedFrontendIP?: IPAddress | null;
  showNewBadge?: boolean;
}

export const NodeBalancerConnectivityPanel = (props: Props) => {
  const {
    backendConnectivityError,
    disabled,
    frontendIPMode,
    isPremiumNodebalancerEnabled,
    nodeBalancerFields,
    reservedIPSectionRef,
    reservedIPError,
    selectedFrontendIP,
    showNewBadge,
    onBackendIPModeChange,
    onFrontendIPModeChange,
    onReservedIPSelect,
  } = props;

  const pendoIdsForReservedIP = {
    // Pendo IDS for the Reserve IP selection
    auto: 'NodeBalancers Create Network-Auto-assigned',
    reserved: 'NodeBalancers Create Network-Reserved',
    reserveIPLink:
      'NodeBalancers Create Network Reserved-Reserve IP Start Flow',
    reserveIPAutocomplete: 'NodeBalancers Create Network-Reserved IPs open',
    reserveIPAutocompleteOptions:
      'NodeBalancers Create Network-Reserved-IP Options',
    // Pendo IDs for the Reserve IP Drawer
    cancelReserveIPDrawer: 'NodeBalancers Create Reserve IP-Cancel',
    closeReserveIPDrawer: 'NodeBalancers Create Reserve IP-Close',
    submitReserveIPDrawer:
      'NodeBalancers Create Reserve IP-Reserve IP Address End Flow',
  };

  const FRONTEND_IP_TOOLTIP_TEXT = {
    auto: "A standard public IPv4 address. If you delete the NodeBalancer, the address can't be reused.",
    reserved:
      'A permanent, static IPv4 address. Use this for services requiring a consistent IP for DNS records or security allowlisting. Reserved IPs are linked to your account and remain available if you delete the NodeBalancer.',
  };

  const BACKEND_IP_TOOLTIP_TEXT = {
    vpc: 'Uses VPC-assigned IPv4 or IPv6 (Beta) addresses to connect to backend nodes within a VPC.',
    ipv6: 'Uses public IPv6 addresses to connect to backend nodes not assigned to a VPC.',
    legacy:
      'Uses private IPv4 addresses to connect to backend nodes not assigned to a VPC.',
  };

  return (
    <Paper>
      {isPremiumNodebalancerEnabled && (
        <>
          <Typography variant="h2">Networking</Typography>
          <Typography mt={Spacing.S12}>
            Choose how your NodeBalancer connects to the public internet and
            backend nodes.
          </Typography>
        </>
      )}
      <Stack>
        <Box ref={reservedIPSectionRef}>
          <IPAddressSelection
            error={reservedIPError}
            label={
              isPremiumNodebalancerEnabled
                ? 'Frontend Connectivity'
                : 'Frontend IP Address'
            }
            mode={frontendIPMode}
            onIPModeChange={onFrontendIPModeChange}
            onReservedIPSelect={onReservedIPSelect}
            pendoIds={pendoIdsForReservedIP}
            regionId={nodeBalancerFields.region ?? ''}
            selectedIP={selectedFrontendIP}
            showNewBadge={showNewBadge}
            sxLabel={
              !isPremiumNodebalancerEnabled ? { fontSize: Font.FontSize.M } : {}
            }
            tooltipText={FRONTEND_IP_TOOLTIP_TEXT}
          />
        </Box>

        {isPremiumNodebalancerEnabled && (
          <Stack
            spacing={Spacing.S16}
            sx={{
              marginTop: frontendIPMode === 'reserved' ? Spacing.S16 : 0,
            }}
          >
            <Typography
              sx={(theme) => ({
                font: theme.font.bold,
              })}
            >
              Backend Connectivity
            </Typography>

            {backendConnectivityError && (
              <Notice
                sx={{
                  marginTop: Spacing.S12,
                  marginBottom: 0,
                }}
                variant="error"
              >
                {backendConnectivityError}
              </Notice>
            )}
            <RadioGroup
              onChange={(e) =>
                onBackendIPModeChange(
                  e.detail.value as NodeBalancerBackendConnectivity
                )
              }
              value={nodeBalancerFields.backend_connectivity ?? 'vpc'}
            >
              <FormControlLabel
                control={
                  <RadioButton
                    checked={nodeBalancerFields.backend_connectivity === 'vpc'}
                    data-pendo-id="NodeBalancers Create Network Connectivity Backend-VPC"
                    data-testid="backend-connectivity-vpc-radio"
                    disabled={disabled}
                    style={{
                      padding: `${Spacing.S8} 0`,
                      marginRight: '0px',
                      marginLeft: Spacing.S12,
                    }}
                    value="vpc"
                  />
                }
                data-pendo-id="NodeBalancers Create Network Connectivity Backend-VPC"
                disabled={disabled}
                key="vpc"
                label={
                  <Stack direction="row" mt={Spacing.S12} spacing={Spacing.S4}>
                    <Typography>VPC</Typography>
                    <TooltipIcon
                      status="info"
                      sxTooltipIcon={{ p: 0 }}
                      text={BACKEND_IP_TOOLTIP_TEXT.vpc}
                      tooltipPosition="right"
                    />
                  </Stack>
                }
                sx={{ alignItems: 'flex-start', display: 'flex' }}
              />
              <FormControlLabel
                control={
                  <RadioButton
                    checked={nodeBalancerFields.backend_connectivity === 'ipv6'}
                    data-pendo-id="NodeBalancers Create Network Connectivity Backend-IPv6"
                    data-testid="backend-connectivity-ipv6-radio"
                    disabled={disabled}
                    style={{
                      padding: `${Spacing.S8} 0`,
                      marginRight: '0px',
                      marginLeft: Spacing.S12,
                    }}
                    value="ipv6"
                  />
                }
                data-pendo-id="NodeBalancers Create Network Connectivity Backend-IPv6"
                disabled={disabled}
                key="ipv6"
                label={
                  <Stack direction="row" mt={Spacing.S12} spacing={Spacing.S4}>
                    <Typography>IPv6</Typography>
                    <TooltipIcon
                      status="info"
                      sxTooltipIcon={{ p: 0 }}
                      text={BACKEND_IP_TOOLTIP_TEXT.ipv6}
                      tooltipPosition="right"
                    />
                  </Stack>
                }
                sx={{
                  alignItems: 'flex-start',
                  display: 'flex',
                }}
              />
              {nodeBalancerFields.type !== 'premium' && (
                <FormControlLabel
                  control={
                    <RadioButton
                      checked={
                        nodeBalancerFields.backend_connectivity === 'legacy'
                      }
                      data-pendo-id="NodeBalancers Create Network Connectivity Backend-Legacy"
                      data-testid="backend-connectivity-legacy-radio"
                      disabled={disabled}
                      style={{
                        padding: `${Spacing.S8} 0`,
                        marginRight: '0px',
                        marginLeft: Spacing.S12,
                      }}
                      value="legacy"
                    />
                  }
                  data-pendo-id="NodeBalancers Create Network Connectivity Backend-Legacy"
                  disabled={disabled}
                  key="Legacy"
                  label={
                    <Stack
                      direction="row"
                      mt={Spacing.S12}
                      spacing={Spacing.S4}
                    >
                      <Typography>Legacy</Typography>
                      <TooltipIcon
                        status="info"
                        sxTooltipIcon={{ p: 0 }}
                        text={BACKEND_IP_TOOLTIP_TEXT.legacy}
                        tooltipPosition="right"
                      />
                    </Stack>
                  }
                  sx={{ alignItems: 'flex-start', display: 'flex' }}
                />
              )}
            </RadioGroup>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
