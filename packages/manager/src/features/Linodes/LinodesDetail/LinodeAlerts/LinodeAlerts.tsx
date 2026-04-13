import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import { getFeatureChip } from '@linode/shared';
import {
  Accordion,
  ActionsPanel,
  Box,
  Divider,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import { UpdateLinodeAlertsSchema } from '@linode/validation';
import { useQueryClient } from '@tanstack/react-query';
import { useBlocker, useParams } from '@tanstack/react-router';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import {
  arraysEqual,
  useIsAclpSupportedRegion,
} from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { invalidateAclpAlerts } from 'src/queries/cloudpulse/useAlertsMutation';

import { AlertsPanel } from './AlertsPanel';
import { getLinodeAlertsInitialValues } from './utilities';

import type { APIError, CloudPulseAlertsPayload, Linode } from '@linode/api-v4';

/**
 * Returns true if two ACLP alert payloads contain the same alert IDs,
 * regardless of array order.
 */
const aclpPayloadsEqual = (
  a: CloudPulseAlertsPayload,
  b: CloudPulseAlertsPayload
): boolean =>
  arraysEqual(a.system_alerts, b.system_alerts) &&
  arraysEqual(a.user_alerts, b.user_alerts);

const LinodeAlerts = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { aclpServices, aclpAlerting } = useFlags();
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
  const queryClient = useQueryClient();

  const {
    error: mutationError,
    isPending: isUpdatingLinode,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(id);

  // Note: ACLP alert fields (system_alerts & user_alerts) are intentionally excluded
  // from initialValues as they are managed separately within AlertReusableComponent.
  const initialValues = getLinodeAlertsInitialValues(linode);

  const [hasLegacyAlertsUnsavedChanges, setHasLegacyAlertsUnsavedChanges] =
    React.useState<boolean>(false);
  const [hasAclpAlertsUnsavedChanges, setHasAclpAlertsUnsavedChanges] =
    React.useState<boolean>(false);

  // Store current ACLP alerts payload
  const [aclpAlertsPayload, setAclpAlertsPayload] = React.useState<
    CloudPulseAlertsPayload | undefined
  >();

  // Tracks what was last saved (or the initial server state on first load).
  // We compare incoming payloads against this to decide if there are unsaved
  // changes, rather than relying on the AlertReusableComponent's `hasUnsavedChanges`
  // which can be stale right after a save while the cache refetches. Updated
  // synchronously on save so the next toggle reflects the correct Save Alerts button state immediately.
  //
  // Note: invalidateAclpAlerts is also called after every save — it solves a
  // separate concern: keeping the toggle row state correct by refreshing
  // entity_ids in the alerts cache. Without it, the toggles would show stale state.
  const savedAclpPayloadRef = React.useRef<CloudPulseAlertsPayload | undefined>(
    undefined
  );

  // Track whether ACLP alerts have finished loading without error
  const [isAclpAlertsReady, setIsAclpAlertsReady] =
    React.useState<boolean>(false);

  const unifiedAlertsContainerRef = React.useRef<HTMLDivElement>(null);

  // Helper to extract general/root errors from API errors array
  // Includes errors without a field property, or with field="alerts" (not field-specific like "alerts.cpu")
  const getGeneralOrRootError = (errors?: APIError[]) => {
    if (!errors) return undefined;
    const rootError = errors.find((e) => !e.field || e.field === 'alerts');
    return rootError?.reason;
  };

  const generalOrRootError = getGeneralOrRootError(mutationError ?? undefined);

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

  // Handles ACLP alert toggle changes from AlertReusableComponent.
  // On the first call (mount), captures the initial server state as what was last saved.
  // On subsequent calls, checks whether the incoming payload differs from what was last saved.
  const handleAclpAlertsToggle = React.useCallback(
    (payload: CloudPulseAlertsPayload) => {
      setAclpAlertsPayload(payload);
      if (savedAclpPayloadRef.current === undefined) {
        // First call on mount - treat this as the initial saved state.
        savedAclpPayloadRef.current = payload;
        setHasAclpAlertsUnsavedChanges(false);
      } else {
        setHasAclpAlertsUnsavedChanges(
          !aclpPayloadsEqual(payload, savedAclpPayloadRef.current)
        );
      }
    },
    []
  );

  // Unified save handler for both legacy and ACLP alerts
  const handleUnifiedSave = React.useCallback(
    async (legacyAlertsValues: Linode['alerts']) => {
      const combinedAlertsPayload: Linode['alerts'] = {
        ...legacyAlertsValues,
        ...aclpAlertsPayload,
      };
      await updateLinode({ alerts: combinedAlertsPayload })
        .then(() => {
          enqueueSnackbar('All your settings for Alerts have been saved.', {
            variant: 'success',
          });
          setHasLegacyAlertsUnsavedChanges(false);
          setHasAclpAlertsUnsavedChanges(false);
          // Update the reference point so the next toggle compares against what was just saved.
          savedAclpPayloadRef.current = aclpAlertsPayload;
          // Invalidate the cache so alert toggles show the correct ON/OFF state
          // after save and when the user navigates away and comes back.
          invalidateAclpAlerts(
            queryClient,
            'linode',
            linodeId.toString(),
            aclpAlertsPayload ?? {}
          );
        })
        .catch((errors) => {
          if (errors && unifiedAlertsContainerRef.current) {
            scrollErrorIntoViewV2(unifiedAlertsContainerRef);
          }
        });
    },
    [aclpAlertsPayload, updateLinode, enqueueSnackbar, queryClient, linodeId]
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
        {isAclpAlertingInRegionEnabled &&
          (aclpAlerting?.beta || aclpAlerting?.new) && (
            <DismissibleBanner
              dismissible={false}
              preferenceKey="alerts-preference-linode-details"
              variant="info"
            >
              <Typography>
                {aclpAlerting.beta && (
                  <>
                    Try the <strong>Alerts (Beta)</strong>, featuring new
                    options like customizable alerts. You can keep your legacy
                    alerts and add them to the new Beta Alerts.
                  </>
                )}

                {!aclpAlerting.beta && aclpAlerting.new && (
                  <>
                    Try <strong>Alerts (New)</strong> with features like
                    customizable alerts. Legacy and new alerts can be used
                    together.
                  </>
                )}
              </Typography>
            </DismissibleBanner>
          )}
        {isAclpAlertingInRegionEnabled ? (
          // Unified mode - both Legacy Alerts and ACLP Alerts are displayed with a shared save button.
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={handleUnifiedSave}
            validateOnChange
            validationSchema={UpdateLinodeAlertsSchema}
          >
            {(formik) => (
              <>
                <Paper
                  ref={unifiedAlertsContainerRef}
                  sx={(theme) => ({ pb: theme.spacingFunction(16) })}
                >
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
                    {/* Legacy Alerts View when ACLP alerting is enabled */}
                    <Accordion
                      defaultExpanded
                      detailProps={{ sx: { p: 0 } }}
                      heading="Legacy Alerts"
                      summaryProps={{ sx: { p: 0 } }}
                    >
                      <AlertsPanel
                        error={mutationError}
                        formik={formik}
                        isAclpAlertingInRegionEnabled={
                          isAclpAlertingInRegionEnabled
                        }
                        isReadOnly={!permissions.update_linode}
                        isSaving={isUpdatingLinode}
                        linodeId={id}
                        onUnsavedChangesUpdate={
                          setHasLegacyAlertsUnsavedChanges
                        }
                        paperSx={(theme) => ({
                          px: 0,
                          py: theme.spacingFunction(8),
                        })}
                      />
                    </Accordion>

                    {/* ACLP Alerts View when ACLP alerting is enabled */}
                    <Accordion
                      defaultExpanded
                      detailProps={{ sx: { p: 0 } }}
                      disableGutters // Removes unnecessary default margins when stacking Accordions
                      heading="Alerts"
                      headingChip={getFeatureChip(aclpAlerting ?? {})}
                      summaryProps={{ sx: { p: 0 } }}
                    >
                      <AlertReusableComponent
                        entityId={linodeId.toString()}
                        entityName={linode?.label ?? ''}
                        onStatusChange={setIsAclpAlertsReady}
                        onToggleAlert={handleAclpAlertsToggle}
                        paperSx={(theme) => ({
                          px: 0,
                          py: theme.spacingFunction(16),
                        })}
                        serviceType="linode"
                      />
                    </Accordion>
                  </Stack>
                </Paper>

                {/* Unified Save Button */}
                <ActionsPanel
                  primaryButtonProps={{
                    'data-testid': 'unified-alerts-save',
                    disabled:
                      (!formik.dirty && !hasAclpAlertsUnsavedChanges) ||
                      !isAclpAlertsReady ||
                      isUpdatingLinode,
                    label: 'Save Alerts',
                    loading: isUpdatingLinode,
                    onClick: () => formik.handleSubmit(),
                  }}
                  sx={{ justifyContent: 'flex-end' }}
                />
              </>
            )}
          </Formik>
        ) : (
          // Standalone mode - only Legacy Alerts are displayed and AlertsPanel manages its own save.
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
