import { Linode } from '@linode/api-v4';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Accordion } from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { useTypeQuery } from 'src/queries/types';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { AlertSection } from './AlertSection';

interface Props {
  linodeId: number;
  isReadOnly?: boolean;
}

export const LinodeSettingsAlertsPanel = (props: Props) => {
  const { linodeId, isReadOnly } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId);

  const {
    mutateAsync: updateLinode,
    isLoading,
    error,
  } = useLinodeUpdateMutation(linodeId);

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
    async onSubmit({ cpu, network_in, network_out, transfer_quota, io }) {
      await updateLinode({
        alerts: {
          cpu: isBareMetalInstance ? undefined : cpu,
          network_in: isBareMetalInstance ? undefined : network_in,
          network_out,
          transfer_quota,
          io,
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
      'alerts.network_in': 'Incoming traffic',
      'alerts.network_out': 'Outbound traffic',
      'alerts.transfer_quota': 'Transfer quota',
      'alerts.io': 'Disk I/O rate',
    },
    error ?? undefined
  );

  const alertSections = [
    {
      title: 'CPU Usage',
      textTitle: 'Usage Threshold',
      radioInputLabel: 'cpu_usage_state',
      textInputLabel: 'cpu_usage_threshold',
      copy:
        'Average CPU usage over 2 hours exceeding this value triggers this alert.',
      state: formik.values.cpu > 0,
      value: formik.values.cpu,
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
        formik.setFieldValue('cpu', e.target.valueAsNumber),
      error: hasErrorFor('alerts.cpu'),
      endAdornment: '%',
      hidden: isBareMetalInstance,
    },
    {
      radioInputLabel: 'disk_io_state',
      textInputLabel: 'disk_io_threshold',
      textTitle: 'I/O Threshold',
      title: 'Disk I/O Rate',
      copy:
        'Average Disk I/O ops/sec over 2 hours exceeding this value triggers this alert.',
      state: formik.values.io > 0,
      value: formik.values.io,
      onStateChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean
      ) =>
        formik.setFieldValue(
          'io',
          checked ? (linode?.alerts.io ? linode?.alerts.io : 10000) : 0
        ),
      onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        formik.setFieldValue('io', e.target.valueAsNumber),
      error: hasErrorFor('alerts.io'),
      endAdornment: 'IOPS',
      hidden: isBareMetalInstance,
    },
    {
      radioInputLabel: 'incoming_traffic_state',
      textInputLabel: 'incoming_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Incoming Traffic',
      copy: `Average incoming traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      state: formik.values.network_in > 0,
      value: formik.values.network_in,
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
        formik.setFieldValue('network_in', e.target.valueAsNumber),
      error: hasErrorFor('alerts.network_in'),
      endAdornment: 'Mb/s',
    },
    {
      radioInputLabel: 'outbound_traffic_state',
      textInputLabel: 'outbound_traffic_threshold',
      textTitle: 'Traffic Threshold',
      title: 'Outbound Traffic',
      copy: `Average outbound traffic over a 2 hour period exceeding this value triggers this
        alert.`,
      state: formik.values.network_out > 0,
      value: formik.values.network_out,
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
        formik.setFieldValue('network_out', e.target.valueAsNumber),
      error: hasErrorFor('alerts.network_out'),
      endAdornment: 'Mb/s',
    },
    {
      radioInputLabel: 'transfer_quota_state',
      textInputLabel: 'transfer_quota_threshold',
      textTitle: 'Quota Threshold',
      title: 'Transfer Quota',
      copy: `Percentage of network transfer quota used being greater than this value will trigger
          this alert.`,
      state: formik.values.transfer_quota > 0,
      value: formik.values.transfer_quota,
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
        formik.setFieldValue('transfer_quota', e.target.valueAsNumber),
      error: hasErrorFor('alerts.transfer_quota'),
      endAdornment: '%',
    },
  ].filter((thisAlert) => !thisAlert.hidden);

  const renderExpansionActions = () => {
    return (
      <ActionsPanel
        showPrimary
        primaryButtonDataTestId="alerts-save"
        primaryButtonDisabled={isReadOnly || !formik.dirty}
        primaryButtonHandler={() => formik.handleSubmit()}
        primaryButtonLoading={isLoading}
        primaryButtonText="Save"
      />
    );
  };

  const generalError = hasErrorFor('none');

  return (
    <Accordion
      heading="Notification Thresholds"
      actions={renderExpansionActions}
      defaultExpanded
    >
      {generalError && <Notice error>{generalError}</Notice>}
      {alertSections.map((p, idx) => (
        <AlertSection key={idx} {...p} readOnly={isReadOnly} />
      ))}
    </Accordion>
  );
};
