import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import {
  Accordion,
  ActionsPanel,
  BetaChip,
  Box,
  Divider,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { useBlocker, useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AlertsPanel } from './AlertsPanel';

import type { AlertsPanelHandle } from './AlertsPanel';
import type { CloudPulseAlertsPayload } from '@linode/api-v4';
import type { APIError, Linode } from '@linode/api-v4';

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

  const { enqueueSnackbar } = useSnackbar();

  const {
    error: mutationError,
    isPending: isUpdatingLinode,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(id);

  // Helper to extract general/root errors from API errors array
  // Includes errors without a field property, or with field="alerts" (not field-specific like "alerts.cpu")
  const getGeneralOrRootError = (errors?: APIError[]) => {
    if (!errors) return undefined;
    const rootError = errors.find((e) => !e.field || e.field === 'alerts');
    return rootError?.reason;
  };

  const generalOrRootError = getGeneralOrRootError(mutationError ?? undefined);

  const [hasLegacyAlertsUnsavedChanges, setHasLegacyAlertsUnsavedChanges] =
    React.useState<boolean>(false);
  const [hasAclpAlertsUnsavedChanges, setHasAclpAlertsUnsavedChanges] =
    React.useState<boolean>(false);

  // Ref to access AlertsPanel methods
  const legacyAlertsPanelRef = React.useRef<AlertsPanelHandle>(null);

  // Store current ACLP alerts payload
  const [aclpAlertsPayload, setAclpAlertsPayload] = React.useState<
    CloudPulseAlertsPayload | undefined
  >();

  const aclpEnabledViewRef = React.useRef<HTMLDivElement>(null);

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

  // Unified save handler for both legacy and ACLP alerts
  const handleUnifiedSave = React.useCallback(async () => {
    if (!legacyAlertsPanelRef.current) {
      enqueueSnackbar('Unable to access legacy alerts form', {
        variant: 'error',
      });
      return;
    }

    const { values: legacyAlertsValues, errors } =
      await legacyAlertsPanelRef.current.validateFormAndGetValues();

    // If there are validation errors in the legacy alerts form, scroll into ACLP Enabled view.
    if (errors && Object.keys(errors).length > 0) {
      scrollErrorIntoViewV2(aclpEnabledViewRef);
      return;
    }

    const combinedAlertsPayload: Linode['alerts'] = {
      ...legacyAlertsValues,
      ...aclpAlertsPayload,
    };
    await updateLinode({ alerts: combinedAlertsPayload })
      .then(() => {
        enqueueSnackbar('Alert settings have been saved successfully', {
          variant: 'success',
        });
        setHasLegacyAlertsUnsavedChanges(false);
        setHasAclpAlertsUnsavedChanges(false);
      })
      .catch((errors) => {
        const errorMessage = getGeneralOrRootError(errors);
        if (errorMessage && aclpEnabledViewRef.current) {
          scrollErrorIntoViewV2(aclpEnabledViewRef);
        }
      });
  }, [aclpAlertsPayload, updateLinode, enqueueSnackbar]);

  // Handler for legacy alerts save in standalone mode
  const handleLegacySave = React.useCallback(
    async (alerts: Linode['alerts']) => {
      await updateLinode({ alerts })
        .then(() => {
          enqueueSnackbar(
            `Successfully updated alert settings for ${linode?.label}`,
            { variant: 'success' }
          );
        })
        .catch(() => {
          // Error is handled by React Query and displayed via mutationError prop
        });
    },
    [updateLinode, enqueueSnackbar, linode?.label]
  );

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
          <Paper ref={aclpEnabledViewRef}>
            {/* Display general mutation error globally for unified save */}
            {generalOrRootError && (
              <Notice
                sx={(theme) => ({ mb: theme.spacingFunction(8) })}
                variant="error"
              >
                {generalOrRootError}
              </Notice>
            )}
            <Stack divider={<Divider />}>
              {/* Legacy ACLP Alerts View */}
              <Accordion
                defaultExpanded
                detailProps={{ sx: { p: 0 } }}
                heading="Legacy Alerts"
                summaryProps={{ sx: { p: 0 } }}
              >
                <AlertsPanel
                  error={mutationError}
                  isAclpAlertingInRegionEnabled={isAclpAlertingInRegionEnabled}
                  isReadOnly={!permissions.update_linode}
                  isSaving={isUpdatingLinode}
                  linodeId={id}
                  onUnsavedChangesUpdate={(hasUnsavedChanges) => {
                    setHasLegacyAlertsUnsavedChanges(hasUnsavedChanges);
                  }}
                  paperSx={(theme) => ({
                    px: 0,
                    py: theme.spacingFunction(8),
                  })}
                  ref={legacyAlertsPanelRef}
                />
              </Accordion>

              {/* Beta ACLP Alerts View */}
              <Accordion
                defaultExpanded
                detailProps={{ sx: { p: 0 } }}
                disableGutters // Removes unnecessary default margins when stacking Accordions
                heading="Alerts"
                headingChip={
                  aclpServices?.linode?.alerts?.beta ? <BetaChip /> : null
                }
                summaryProps={{ sx: { p: 0 } }}
              >
                <AlertReusableComponent
                  entityId={linodeId.toString()}
                  entityName={linode?.label ?? ''}
                  onToggleAlert={(payload, hasUnsavedChanges) => {
                    setAclpAlertsPayload(payload);
                    setHasAclpAlertsUnsavedChanges(hasUnsavedChanges ?? false);
                  }}
                  paperSx={(theme) => ({
                    px: 0,
                    py: theme.spacingFunction(16),
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
                  (!hasLegacyAlertsUnsavedChanges &&
                    !hasAclpAlertsUnsavedChanges) ||
                  isUpdatingLinode,
                label: 'Save Alerts',
                loading: isUpdatingLinode,
                onClick: handleUnifiedSave,
              }}
              sx={{ justifyContent: 'flex-start' }}
            />
          </Paper>
        ) : (
          // Legacy Alerts View (standalone, uses Paper)
          <AlertsPanel
            error={mutationError}
            isReadOnly={!permissions.update_linode}
            isSaving={isUpdatingLinode}
            linodeId={id}
            onSave={handleLegacySave}
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
