import { useLinodeQuery } from '@linode/queries';
import {
  Accordion,
  ActionsPanel,
  BetaChip,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useBlocker, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AlertsPanel } from './AlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { aclpServices } = useFlags();
  const { data: linode } = useLinodeQuery(id);

  const { data: permissions } = usePermissions('linode', ['update_linode'], id);

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'alerts',
  });

  const isAclpAlertingInRegionEnabled =
    aclpServices?.linode?.alerts?.enabled && isAclpAlertsSupportedRegionLinode;

  const [hasLegacyAlertsUnsavedChanges, setHasLegacyAlertsUnsavedChanges] =
    React.useState<boolean>(false);
  const [hasAclpAlertsUnsavedChanges, setHasAclpAlertsUnsavedChanges] =
    React.useState<boolean>(false);

  const { proceed, reset, status } = useBlocker({
    enableBeforeUnload:
      hasLegacyAlertsUnsavedChanges || hasAclpAlertsUnsavedChanges,
    shouldBlockFn: ({ next }) => {
      const hasUnsavedChanges =
        hasLegacyAlertsUnsavedChanges || hasAclpAlertsUnsavedChanges;

      // Only block if there are unsaved changes
      if (!hasUnsavedChanges) {
        return false;
      }

      // Don't block navigation to the specific route
      const isNavigatingToAllowedRoute =
        next.routeId === '/linodes/$linodeId/alerts';

      return !isNavigatingToAllowedRoute;
    },
    withResolver: true,
  });

  // Create a combined handler for proceeding with navigation
  const handleProceedNavigation = React.useCallback(() => {
    if (status === 'blocked' && proceed) {
      proceed();
    }
  }, [status, proceed]);

  // Create a combined handler for canceling navigation
  const handleCancelNavigation = React.useCallback(() => {
    if (status === 'blocked' && reset) {
      reset();
    }
  }, [status, reset]);

  return (
    <>
      <ConfirmationDialog
        actions={() => (
          <ActionsPanel
            primaryButtonProps={{
              label: 'Confirm',
              onClick: () => {
                handleProceedNavigation();
              },
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: () => {
                handleCancelNavigation();
              },
            }}
          />
        )}
        onClose={() => {
          handleCancelNavigation();
        }}
        open={status === 'blocked'}
        title="Unsaved Changes"
      >
        <Typography variant="body1">
          Are you sure you want to leave the page? You have unsaved changes.
        </Typography>
      </ConfirmationDialog>
      <Box>
        {isAclpAlertingInRegionEnabled && (
          <DismissibleBanner
            dismissible={false}
            preferenceKey="alerts-preference-linode-details"
            variant="info"
          >
            <Typography>
              Try the <strong>Alerts (Beta)</strong>, featuring new options like
              customizable alerts. You can switch back to legacy Alerts at any
              time.
            </Typography>
          </DismissibleBanner>
        )}
        {isAclpAlertingInRegionEnabled ? (
          <Paper>
            <Stack divider={<Divider />}>
              {/* Legacy ACLP Alerts View */}
              <Accordion
                defaultExpanded
                detailProps={{ sx: { p: 0 } }}
                heading="Legacy Alerts"
              >
                <AlertsPanel
                  isAclpAlertingInRegionEnabled={isAclpAlertingInRegionEnabled}
                  isReadOnly={!permissions.update_linode}
                  linodeId={id}
                  onUnsavedChangesUpdate={(hasUnsavedChanges) => {
                    setHasLegacyAlertsUnsavedChanges(hasUnsavedChanges);
                  }}
                  paperSx={(theme) => ({ p: theme.spacingFunction(16) })}
                />
              </Accordion>

              {/* Beta ACLP Alerts View */}
              <Accordion
                defaultExpanded
                heading="Alerts"
                headingChip={
                  aclpServices?.linode?.alerts?.beta ? <BetaChip /> : null
                }
              >
                <AlertReusableComponent
                  entityId={linodeId.toString()}
                  entityName={linode?.label ?? ''}
                  onToggleAlert={(payload, hasUnsavedChanges) => {
                    setHasAclpAlertsUnsavedChanges(hasUnsavedChanges ?? false);
                  }}
                  paperSx={(theme) => ({
                    py: theme.spacingFunction(16),
                    px: 0,
                  })}
                  serviceType="linode"
                />
              </Accordion>
            </Stack>

            {/* Unified Save Button */}
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'unified-alerts-save',
                disabled:
                  !hasLegacyAlertsUnsavedChanges &&
                  !hasAclpAlertsUnsavedChanges,
                label: 'Save Alerts',
                onClick: () => {},
              }}
              sx={{ justifyContent: 'flex-start' }}
            />
          </Paper>
        ) : (
          // Legacy Alerts View (standalone, uses Paper)
          <AlertsPanel
            isReadOnly={!permissions.update_linode}
            linodeId={id}
            onUnsavedChangesUpdate={(hasUnsavedChanges) => {
              setHasLegacyAlertsUnsavedChanges(hasUnsavedChanges);
            }}
            paperSx={(theme) => ({ pb: theme.spacingFunction(16) })}
          />
        )}
      </Box>
    </>
  );
};

export default LinodeAlerts;
