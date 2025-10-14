import { useLinodeQuery } from '@linode/queries';
import { useIsLinodeAclpSubscribed } from '@linode/shared';
import { ActionsPanel, Box, Typography } from '@linode/ui';
import { useBlocker, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { useLinodeDetailContext } from '../LinodesDetailContext';
import { AlertsPanel } from './AlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);
  const { isAlertsBetaMode } = useLinodeDetailContext();

  const { aclpServices } = useFlags();
  const { data: linode } = useLinodeQuery(id);

  const { data: permissions } = usePermissions('linode', ['update_linode'], id);

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'alerts',
  });
  const isLinodeAclpSubscribed = useIsLinodeAclpSubscribed(id, 'beta');

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
        {aclpServices?.linode?.alerts?.enabled &&
          isAclpAlertsSupportedRegionLinode && (
            <AclpPreferenceToggle
              isAlertsBetaMode={isAlertsBetaMode.get}
              onAlertsModeChange={isAlertsBetaMode.set}
              type="alerts"
            />
          )}
        {aclpServices?.linode?.alerts?.enabled &&
        isAclpAlertsSupportedRegionLinode &&
        isAlertsBetaMode.get ? (
          // Beta ACLP Alerts View
          <AlertReusableComponent
            entityId={linodeId.toString()}
            entityName={linode?.label ?? ''}
            isLegacyAlertAvailable={!isLinodeAclpSubscribed}
            onToggleAlert={(_, hasUnsavedChanges) => {
              setHasAclpAlertsUnsavedChanges(hasUnsavedChanges ?? false);
            }}
            serviceType="linode"
          />
        ) : (
          // Legacy Alerts View
          <AlertsPanel
            isReadOnly={!permissions.update_linode}
            linodeId={id}
            onUnsavedChangesUpdate={(hasUnsavedChanges) => {
              setHasLegacyAlertsUnsavedChanges(hasUnsavedChanges);
            }}
          />
        )}
      </Box>
    </>
  );
};

export default LinodeAlerts;
