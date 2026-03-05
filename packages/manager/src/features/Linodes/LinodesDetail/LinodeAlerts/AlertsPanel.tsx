import {
  useLinodeQuery,
  useLinodeUpdateMutation,
  useTypeQuery,
} from '@linode/queries';
import { ActionsPanel, Divider, Notice, Paper, Typography } from '@linode/ui';
import { UpdateLinodeAlertsSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { AlertSection } from './AlertSection';
import { getLinodeAlertsInitialValues } from './utilities';

import type { AlertSectionProps } from './AlertSection';
import type { APIError, Linode } from '@linode/api-v4';
import type { SxProps, Theme } from '@linode/ui';
import type { FormikProps } from 'formik';

interface Props {
  /**
   * API error to display
   */
  error?: APIError[] | null;
  /**
   * Formik passed down from LinodeAlerts in unified mode (ACLP flag ON).
   * Not needed in standalone or create-flow - those modes manage Formik internally.
   */
  formik?: FormikProps<Linode['alerts']>;
  /**
   * Whether ACLP alerting is enabled in the current region
   * Combines ACLP flag check and region support
   */
  isAclpAlertingInRegionEnabled?: boolean;
  /**
   * Whether the panel is read-only
   */
  isReadOnly?: boolean;
  /**
   * Loading state for save operation
   */
  isSaving?: boolean;
  /**
   * Optional Linode ID.
   * - If provided, the Alerts Panel will be in the edit flow mode.
   * - If not provided, the Alerts Panel will be in the create flow mode (read-only).
   */
  linodeId?: number;
  /**
   * Callback triggered when the Legacy Alerts form has unsaved changes.
   * Receives `true` when there are unsaved changes, and `false` when the form is clean.
   */
  onUnsavedChangesUpdate?: (hasUnsavedChanges: boolean) => void;
  /**
   * Custom sx styles for the Paper wrapper component
   */
  paperSx?: SxProps<Theme>;
}

/**
 * Handles three rendering modes depending on context:
 * - Create flow (no linodeId): read-only, Formik is a no-op
 * - Standalone (linodeId, ACLP flag OFF): self-contained with its own Formik and save
 * - Unified (linodeId, ACLP flag ON): parent LinodeAlerts owns Formik, passes it down
 */
export const AlertsPanel = (props: Props) => {
  const { isAclpAlertingInRegionEnabled, linodeId } = props;

  // Create flow: read-only with default values, no submission needed.
  if (!linodeId) {
    return (
      <Formik
        initialValues={{
          cpu: 90,
          io: 10000,
          network_in: 10,
          network_out: 10,
          transfer_quota: 80,
        }}
        onSubmit={() => {}}
      >
        {(formik) => <AlertsPanelContent {...props} formik={formik} />}
      </Formik>
    );
  }

  // Unified Legacy mode: formik comes from the parent.
  if (isAclpAlertingInRegionEnabled) {
    return (
      <AlertsPanelContent
        {...props}
        formik={props.formik!}
        linodeId={linodeId}
      />
    );
  }

  // Standalone Legacy mode: self-contained, owns its own save logic.
  return <AlertsPanelStandalone {...props} linodeId={linodeId} />;
};

/**
 * Used when the ACLP flag is OFF. Manages its own data fetching, mutation, and form state
 * so the parent doesn't need to know anything about how the save works.
 */
const AlertsPanelStandalone = (props: Props & { linodeId: number }) => {
  const { linodeId, ...rest } = props;

  const { data: linode } = useLinodeQuery(linodeId);
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isPending: isSaving,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  const handleSave = async (alerts: Linode['alerts']) => {
    await updateLinode({ alerts })
      .then(() => {
        enqueueSnackbar(
          `Successfully updated alert settings for ${linode?.label}`,
          { variant: 'success' }
        );
      })
      .catch(() => {
        // Error is displayed via the error prop passed to AlertsPanelContent below.
      });
  };

  const initialValues = getLinodeAlertsInitialValues(linode);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSave}
      validateOnChange
      validationSchema={UpdateLinodeAlertsSchema}
    >
      {(formik) => (
        <AlertsPanelContent
          {...rest}
          error={error}
          formik={formik}
          isSaving={isSaving}
          linodeId={linodeId}
        />
      )}
    </Formik>
  );
};

interface AlertsPanelContentProps extends Omit<Props, 'formik'> {
  formik: FormikProps<Linode['alerts']>;
}

/** Renders the form fields and save button. Formik is always passed in explicitly. */
const AlertsPanelContent = (props: AlertsPanelContentProps) => {
  const {
    error,
    formik,
    isAclpAlertingInRegionEnabled,
    isSaving,
    isReadOnly,
    linodeId,
    paperSx,
  } = props;

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const isBareMetalInstance = type?.class === 'metal';

  const isCreateFlow = !linodeId;

  const hasAPIErrorFor = getAPIErrorFor(
    {
      'alerts.cpu': 'CPU',
      'alerts.io': 'Disk I/O rate',
      'alerts.network_in': 'Incoming traffic',
      'alerts.network_out': 'Outbound traffic',
      'alerts.transfer_quota': 'Transfer quota',
    },
    error ?? undefined
  );

  const generalError = hasAPIErrorFor('none');

  const alertSections: AlertSectionProps[] = [
    {
      copy: 'Average CPU usage over 2 hours exceeding this value triggers this alert.',
      endAdornment: '%',
      error:
        (formik.touched.cpu ? formik.errors.cpu : undefined) ||
        hasAPIErrorFor('alerts.cpu'),
      hidden: isBareMetalInstance,
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'cpu',
          checked
            ? linode?.alerts.cpu
              ? linode?.alerts.cpu
              : 90 * (linode?.specs.vcpus ?? 1)
            : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue(
          'cpu',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : ''
        );
      },
      onBlur: () => {
        formik.setFieldTouched('cpu');
      },
      radioInputLabel: 'cpu_usage_state',
      state:
        formik.values.cpu === ('' as unknown) || Boolean(formik.values.cpu),
      textInputLabel: 'cpu_usage_threshold',
      textTitle: 'Usage Threshold',
      title: 'CPU Usage',
      value: formik.values.cpu ?? 0,
    },
    {
      copy: 'Average Disk I/O ops/sec over 2 hours exceeding this value triggers this alert.',
      endAdornment: 'IOPS',
      error:
        (formik.touched.io ? formik.errors.io : undefined) ||
        hasAPIErrorFor('alerts.io'),
      hidden: isBareMetalInstance,
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'io',
          checked ? (linode?.alerts.io ? linode?.alerts.io : 10000) : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue(
          'io',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : ''
        ),
      onBlur: () => {
        formik.setFieldTouched('io');
      },
      radioInputLabel: 'disk_io_state',
      state: formik.values.io === ('' as unknown) || Boolean(formik.values.io),
      textInputLabel: 'disk_io_threshold',
      textTitle: 'I/O Threshold',
      title: 'Disk I/O Rate',
      value: formik.values.io ?? 0,
    },
    {
      copy: `Average incoming traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      endAdornment: 'Mb/s',
      error:
        (formik.touched.network_in ? formik.errors.network_in : undefined) ||
        hasAPIErrorFor('alerts.network_in'),
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'network_in',
          checked
            ? linode?.alerts.network_in
              ? linode?.alerts.network_in
              : 10
            : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue(
          'network_in',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : ''
        ),
      onBlur: () => {
        formik.setFieldTouched('network_in');
      },
      radioInputLabel: 'incoming_traffic_state',
      state:
        formik.values.network_in === ('' as unknown) ||
        Boolean(formik.values.network_in),
      textInputLabel: 'incoming_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Incoming Traffic',
      value: formik.values.network_in ?? 0,
    },
    {
      copy: `Average outbound traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      endAdornment: 'Mb/s',
      error:
        (formik.touched.network_out ? formik.errors.network_out : undefined) ||
        hasAPIErrorFor('alerts.network_out'),
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'network_out',
          checked
            ? linode?.alerts.network_out
              ? linode?.alerts.network_out
              : 10
            : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue(
          'network_out',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : ''
        ),
      onBlur: () => {
        formik.setFieldTouched('network_out');
      },
      radioInputLabel: 'outbound_traffic_state',
      state:
        formik.values.network_out === ('' as unknown) ||
        Boolean(formik.values.network_out),
      textInputLabel: 'outbound_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Outbound Traffic',
      value: formik.values.network_out ?? 0,
    },
    {
      copy: `Percentage of network transfer quota used being greater than this value will trigger
          this alert.`,
      endAdornment: '%',
      error:
        (formik.touched.transfer_quota
          ? formik.errors.transfer_quota
          : undefined) || hasAPIErrorFor('alerts.transfer_quota'),
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'transfer_quota',
          checked
            ? linode?.alerts.transfer_quota
              ? linode?.alerts.transfer_quota
              : 80
            : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue(
          'transfer_quota',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : ''
        ),
      onBlur: () => {
        formik.setFieldTouched('transfer_quota');
      },
      radioInputLabel: 'transfer_quota_state',
      state:
        formik.values.transfer_quota === ('' as unknown) ||
        Boolean(formik.values.transfer_quota),
      textInputLabel: 'transfer_quota_threshold',
      textTitle: 'Quota Threshold',
      title: 'Transfer Quota',
      value: formik.values.transfer_quota ?? 0,
    },
  ].filter((thisAlert) => !thisAlert.hidden);

  const handleSaveClick = () => {
    formik.handleSubmit();
  };

  React.useEffect(() => {
    if (props.onUnsavedChangesUpdate) {
      const hasUnsavedChanges = formik.dirty;
      props.onUnsavedChangesUpdate(hasUnsavedChanges);
    }

    return () => {
      // Cleanup on unmount
      if (props.onUnsavedChangesUpdate) {
        props.onUnsavedChangesUpdate(false);
      }
    };
  }, [formik.dirty]);

  return (
    <Paper sx={paperSx}>
      {/* Only show "Alerts" heading in legacy standalone mode (not CreateFlow and ACLP not enabled).
      When ACLP is enabled AND region is supported, this component is rendered inside an Accordion which already provides the heading.
      In CreateFlow, the heading is not needed. */}
      {!isCreateFlow && !isAclpAlertingInRegionEnabled && (
        <Typography
          sx={(theme) => ({ mb: theme.spacingFunction(12) })}
          variant="h2"
        >
          Alerts
        </Typography>
      )}

      {/* Only show this general error in standalone Legacy mode. When ACLP alerting is enabled in the region,
      it's displayed in the parent LinodeAlerts component instead */}
      {!isAclpAlertingInRegionEnabled && generalError && (
        <Notice variant="error">{generalError}</Notice>
      )}
      {alertSections.map((alert, idx) => (
        <React.Fragment key={`alert-${idx}`}>
          <AlertSection {...alert} readOnly={isReadOnly || isCreateFlow} />
          {idx !== alertSections.length - 1 ? <Divider /> : null}
        </React.Fragment>
      ))}

      {/* Show save button only in legacy standalone mode (not CreateFlow and ACLP not enabled).
      When ACLP is enabled, save functionality is handled by the unified save button in parent LinodeAlerts component. */}
      {!isCreateFlow && !isAclpAlertingInRegionEnabled && (
        <StyledActionsPanel
          primaryButtonProps={{
            'data-testid': 'alerts-save',
            disabled: isReadOnly || !formik.dirty || isSaving,
            label: 'Save',
            loading: isSaving,
            onClick: handleSaveClick,
          }}
        />
      )}
    </Paper>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  justifyContent: 'flex-start',
  margin: 0,
});
