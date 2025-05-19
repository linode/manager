import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';
import { ActionsPanel, Divider, Notice, Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useTypeQuery } from 'src/queries/types';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { AlertSection } from './AlertSection';

import type { Linode } from '@linode/api-v4';

interface Props {
  isCreateFlow?: boolean;
  isReadOnly?: boolean;
  linodeId?: number;
}

export const LinodeSettingsAlertsPanel = (props: Props) => {
  const { isCreateFlow, isReadOnly, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();

  const { data: linode } = useLinodeQuery(linodeId ?? -1);

  const {
    error,
    isPending,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId ?? -1);

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const isBareMetalInstance = type?.class === 'metal';

  const formik = useFormik<Linode['alerts']>({
    enableReinitialize: true,
    initialValues: {
      cpu: linode?.alerts.cpu ?? 0,
      io: linode?.alerts.io ?? 0,
      network_in: linode?.alerts.network_in ?? 0,
      network_out: linode?.alerts.network_out ?? 0,
      transfer_quota: linode?.alerts.transfer_quota ?? 0,
    },
    async onSubmit({ cpu, io, network_in, network_out, transfer_quota }) {
      await updateLinode({
        alerts: {
          cpu: isBareMetalInstance ? undefined : cpu,
          io,
          network_in: isBareMetalInstance ? undefined : network_in,
          network_out,
          transfer_quota,
        },
      });

      enqueueSnackbar(
        `Successfully updated alert settings for ${linode?.label}`,
        { variant: 'success' }
      );
    },
  });

  const hasErrorFor = getAPIErrorFor(
    {
      'alerts.cpu': 'CPU',
      'alerts.io': 'Disk I/O rate',
      'alerts.network_in': 'Incoming traffic',
      'alerts.network_out': 'Outbound traffic',
      'alerts.transfer_quota': 'Transfer quota',
    },
    error ?? undefined
  );

  const alertSections = [
    {
      copy: 'Average CPU usage over 2 hours exceeding this value triggers this alert.',
      endAdornment: '%',
      error: hasErrorFor('alerts.cpu'),
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
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue(
          'cpu',
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0
        ),
      radioInputLabel: 'cpu_usage_state',
      state: formik.values.cpu > 0,
      textInputLabel: 'cpu_usage_threshold',
      textTitle: 'Usage Threshold',
      title: 'CPU Usage',
      value: formik.values.cpu,
    },
    {
      copy: 'Average Disk I/O ops/sec over 2 hours exceeding this value triggers this alert.',
      endAdornment: 'IOPS',
      error: hasErrorFor('alerts.io'),
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
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0
        ),
      radioInputLabel: 'disk_io_state',
      state: formik.values.io > 0,
      textInputLabel: 'disk_io_threshold',
      textTitle: 'I/O Threshold',
      title: 'Disk I/O Rate',
      value: formik.values.io,
    },
    {
      copy: `Average incoming traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      endAdornment: 'Mb/s',
      error: hasErrorFor('alerts.network_in'),
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
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0
        ),
      radioInputLabel: 'incoming_traffic_state',
      state: formik.values.network_in > 0,
      textInputLabel: 'incoming_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Incoming Traffic',
      value: formik.values.network_in,
    },
    {
      copy: `Average outbound traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      endAdornment: 'Mb/s',
      error: hasErrorFor('alerts.network_out'),
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
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0
        ),
      radioInputLabel: 'outbound_traffic_state',
      state: formik.values.network_out > 0,
      textInputLabel: 'outbound_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Outbound Traffic',
      value: formik.values.network_out,
    },
    {
      copy: `Percentage of network transfer quota used being greater than this value will trigger
          this alert.`,
      endAdornment: '%',
      error: hasErrorFor('alerts.transfer_quota'),
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
          !Number.isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : 0
        ),
      radioInputLabel: 'transfer_quota_state',
      state: formik.values.transfer_quota > 0,
      textInputLabel: 'transfer_quota_threshold',
      textTitle: 'Quota Threshold',
      title: 'Transfer Quota',
      value: formik.values.transfer_quota,
    },
  ].filter((thisAlert) => !thisAlert.hidden);

  const generalError = hasErrorFor('none');
  const alertsHeading = flags.aclpIntegration ? 'Default Alerts' : 'Alerts';

  return (
    <Paper sx={(theme) => ({ pb: theme.spacingFunction(16) })}>
      <Typography
        sx={(theme) => ({ mb: theme.spacingFunction(12) })}
        variant="h2"
      >
        {alertsHeading}
      </Typography>
      {generalError && <Notice variant="error">{generalError}</Notice>}
      {alertSections.map((p, idx) => (
        <React.Fragment key={`alert-${idx}`}>
          <AlertSection {...p} readOnly={isReadOnly || isCreateFlow} />
          {idx !== alertSections.length - 1 ? <Divider /> : null}
        </React.Fragment>
      ))}
      {!isCreateFlow && (
        <StyledActionsPanel
          primaryButtonProps={{
            'data-testid': 'alerts-save',
            disabled: isReadOnly || !formik.dirty,
            label: 'Save',
            loading: isPending,
            onClick: () => formik.handleSubmit(),
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
