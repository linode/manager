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
import { UpdateLinodeAlertsSchema } from '@linode/validation';
import { useBlocker, useParams } from '@tanstack/react-router';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AlertsPanel } from './AlertsPanel';
import { getLinodeAlertsInitialValues } from './utilities';

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

  // Unified save handler for both legacy and ACLP alerts
  const handleUnifiedSave = React.useCallback(
    async (legacyAlertsValues: Linode['alerts']) => {
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
          if (errors && unifiedAlertsContainerRef.current) {
            scrollErrorIntoViewV2(unifiedAlertsContainerRef);
          }
        });
    },
    [aclpAlertsPayload, updateLinode, enqueueSnackbar]
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
              customizable alerts. You can keep your legacy alerts and add them
              to the new Beta Alerts.
            </Typography>
          </DismissibleBanner>
        )}
        {isAclpAlertingInRegionEnabled ? (
          // Unified mode - both Legacy Alerts and ACLP Alerts are displayed with a shared save button.
          <Paper ref={unifiedAlertsContainerRef}>
            {/* Display general mutation error globally for unified save */}
            {generalOrRootError && (
              <Notice
                sx={(theme) => ({ mb: theme.spacingFunction(8) })}
                variant="error"
              >
                {generalOrRootError}
              </Notice>
            )}
            <Formik
              enableReinitialize
              initialValues={initialValues}
              onSubmit={handleUnifiedSave}
              validateOnChange
              validationSchema={UpdateLinodeAlertsSchema}
            >
              {(formik) => (
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
                      onUnsavedChangesUpdate={setHasLegacyAlertsUnsavedChanges}
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
                    headingChip={
                      aclpServices?.linode?.alerts?.beta ? <BetaChip /> : null
                    }
                    summaryProps={{ sx: { p: 0 } }}
                  >
                    <AlertReusableComponent
                      entityId={linodeId.toString()}
                      entityName={linode?.label ?? ''}
                      onStatusChange={setIsAclpAlertsReady}
                      onToggleAlert={(payload, hasUnsavedChanges) => {
                        setAclpAlertsPayload(payload);
                        setHasAclpAlertsUnsavedChanges(
                          hasUnsavedChanges ?? false
                        );
                      }}
                      paperSx={(theme) => ({
                        px: 0,
                        py: theme.spacingFunction(16),
                      })}
                      serviceType="linode"
                    />
                  </Accordion>

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
                    sx={{ justifyContent: 'flex-start' }}
                  />
                </Stack>
              )}
            </Formik>
          </Paper>
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
