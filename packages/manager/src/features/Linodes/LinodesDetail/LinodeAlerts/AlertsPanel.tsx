import { useLinodeQuery, useTypeQuery } from '@linode/queries';
import { ActionsPanel, Divider, Notice, Paper, Typography } from '@linode/ui';
import { UpdateLinodeAlertsSchema } from '@linode/validation';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';

import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { AlertSection } from './AlertSection';

import type { AlertSectionProps } from './AlertSection';
import type { APIError, Linode } from '@linode/api-v4';
import type { SxProps, Theme } from '@linode/ui';

interface Props {
  /**
   * API error to display
   */
  error?: APIError[] | null;
  /**
   * Whether ACLP alerting is enabled in the current region
   * Combines ACLP flag check and region support
   */
  isAclpAlertingInRegionEnabled?: boolean;
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
   * Callback to send legacy alerts payload to parent whenever form values change.
   * Used when ACLP alerting is enabled so parent can combine legacy and ACLP alerts for unified save.
   * Do not use together with onSave.
   */
  onGetLegacyAlerts?: (alerts: Linode['alerts']) => void;
  /**
   * Callback to save legacy alerts directly. When provided, AlertsPanel shows its own Save button.
   * Used in standalone mode when ACLP alerting is not enabled.
   * Do not use together with onGetLegacyAlerts.
   */
  onSave?: (alerts: Linode['alerts']) => Promise<void> | void;
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

export const AlertsPanel = (props: Props) => {
  const {
    error,
    isAclpAlertingInRegionEnabled,
    isSaving,
    isReadOnly,
    linodeId,
    onSave,
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

  const initialValues = isCreateFlow
    ? {
        cpu: 90,
        io: 10000,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
      }
    : {
        cpu: linode?.alerts.cpu ?? 0,
        io: linode?.alerts.io ?? 0,
        network_in: linode?.alerts.network_in ?? 0,
        network_out: linode?.alerts.network_out ?? 0,
        transfer_quota: linode?.alerts.transfer_quota ?? 0,
      };

  const formik = useFormik<Linode['alerts']>({
    enableReinitialize: true,
    initialValues,
    validateOnChange: true,
    validationSchema: UpdateLinodeAlertsSchema,
    async onSubmit({ cpu, io, network_in, network_out, transfer_quota }) {
      if (onSave) {
        // Handle bare metal instances - they don't support CPU and network_in alerts
        const alertsPayload: Linode['alerts'] = {
          cpu: isBareMetalInstance ? undefined : cpu,
          io,
          network_in: isBareMetalInstance ? undefined : network_in,
          network_out,
          transfer_quota,
        };
        await onSave(alertsPayload);
      }
    },
  });

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

  // Notify parent of current formik values whenever they change (for unified save)
  React.useEffect(() => {
    if (props.onGetLegacyAlerts) {
      props.onGetLegacyAlerts(formik.values);
    }
  }, [formik.values, props.onGetLegacyAlerts]);

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
      {!isCreateFlow && !isAclpAlertingInRegionEnabled && onSave && (
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
