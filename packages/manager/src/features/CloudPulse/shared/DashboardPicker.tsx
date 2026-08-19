import { Font } from '@akamai/cds-tokens';
import {
  Box,
  ChevronDownIcon,
  ClickAwayListener,
  LinkButton,
  Typography,
} from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';

import { StyledTriggerButton } from './DashboardPicker.styles';
import { DashboardPickerPanel } from './DashboardPickerPanel';

import type { CloudPulseServiceType, Dashboard } from '@linode/api-v4';
import type { Theme } from '@linode/ui';
import type { AclpServices } from 'src/featureFlags';

export interface DashboardPickerProps {
  /**
   * Feature-flag metadata by service type.
   */
  aclpServices?: Partial<AclpServices>;
  /**
   * Disables opening and interaction with the picker trigger.
   */
  disabled?: boolean;
  /**
   * Is contextual view, to show the link to monitor all services or not. If true, the link will be hidden.
   */
  isContextualView?: boolean;
  /**
   * Called when a dashboard is selected or cleared.
   */
  onChange: (dashboard: Dashboard | null) => void;
  /**
   * Dashboard options available to select.
   */
  options: Dashboard[];
  /**
   * Map used to convert service type keys into display labels.
   */
  serviceTypeMap: Map<CloudPulseServiceType, string>;
  /**
   * When false, group headers are hidden (single service type context)
   */
  showServiceTypeLabel?: boolean;
  /**
   * Currently selected dashboard value.
   */
  value: Dashboard | null;
}

export const DashboardPicker = ({
  aclpServices,
  disabled,
  onChange,
  options,
  serviceTypeMap,
  showServiceTypeLabel = true,
  value,
  isContextualView,
}: DashboardPickerProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const triggerLabel = value
    ? `${serviceTypeMap.get(value.service_type) ?? value.service_type} - ${value.label}`
    : 'Select a Dashboard';

  const triggerTextSx = (theme: Theme, isOpen = false) => ({
    color: isOpen
      ? theme.tokens.alias.Content.Text.Primary.Default
      : value
        ? theme.tokens.alias.Content.Text.Primary.Default
        : theme.palette.text.secondary,
    fontWeight: Font.FontWeight.Bold,
  });

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          // single source of vertical inset shared by the trigger and the panel
          paddingTop: theme.spacingFunction(24),
          [theme.breakpoints.down('sm')]: {
            paddingTop: theme.spacingFunction(16),
          },
        })}
      >
        {/* Trigger — always rendered to hold layout, hidden when panel is open */}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          sx={(theme) => ({
            alignItems: 'baseline',
            visibility: open ? 'hidden' : 'visible',
            [theme.breakpoints.down('lg')]: {
              justifyContent: 'flex-start',
            },
          })}
        >
          <StyledTriggerButton
            data-pendo-id="cloudpulse-dashboard-picker-trigger"
            data-testid="dashboard-picker-trigger"
            disabled={disabled}
            onClick={() => setOpen(true)}
            sx={(theme) => ({
              marginLeft: theme.spacingFunction(16),
              [theme.breakpoints.down('sm')]: {
                marginLeft: 0,
              },
            })}
            type="button"
          >
            <Typography sx={triggerTextSx} variant="h2">
              {triggerLabel}
            </Typography>
            <ChevronDownIcon />
          </StyledTriggerButton>
          {isContextualView && (
            <LinkButton
              data-pendo-id="cloudpulse-dashboard-picker-monitor-all-services"
              onClick={() => navigate({ to: '/metrics' })}
              sx={(theme) => ({
                marginLeft: theme.spacingFunction(8),
              })}
            >
              Monitor all services
            </LinkButton>
          )}
        </Box>

        {/* Panel — absolutely positioned to start at the same y as the trigger */}
        {open && (
          <DashboardPickerPanel
            aclpServices={aclpServices}
            handleClose={handleClose}
            onChange={onChange}
            options={options}
            serviceTypeMap={serviceTypeMap}
            showServiceTypeLabel={showServiceTypeLabel}
            triggerLabel={triggerLabel}
            triggerTextSx={triggerTextSx}
            value={value}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
};
