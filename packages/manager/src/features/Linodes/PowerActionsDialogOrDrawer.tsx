import { Config } from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Select from 'src/components/EnhancedSelect/Select';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { usePollingInterval } from 'src/queries/events/events';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import {
  useBootLinodeMutation,
  useLinodeQuery,
  useRebootLinodeMutation,
  useShutdownLinodeMutation,
} from 'src/queries/linodes/linodes';

export type Action = 'Power Off' | 'Power On' | 'Reboot';

interface Props {
  action: Action;
  isOpen: boolean;
  linodeId: number | undefined;
  manuallyUpdateConfigs?: boolean;
  onClose: () => void;
}

/**
 * In special cases, such as Rescue mode, the API's method
 * for determining the last booted config doesn't work as
 * expected. To avoid these cases, we should always pass
 * the configId if there's only a single available config.
 *
 * @param configs
 */
export const selectDefaultConfig = (configs?: Config[]) =>
  configs?.length === 1 ? configs[0].id : undefined;

export const PowerActionsDialog = (props: Props) => {
  const { action, isOpen, linodeId, manuallyUpdateConfigs, onClose } = props;
  const theme = useTheme();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && isOpen
  );

  const {
    data: configs,
    error: configsError,
    isLoading: configsLoading,
  } = useAllLinodeConfigsQuery(
    linodeId ?? -1,
    linodeId !== undefined && isOpen
  );

  const {
    error: bootError,
    isLoading: isBooting,
    mutateAsync: bootLinode,
  } = useBootLinodeMutation(
    linodeId ?? -1,
    manuallyUpdateConfigs ? configs : undefined
  );

  const {
    error: rebootError,
    isLoading: isRebooting,
    mutateAsync: rebootLinode,
  } = useRebootLinodeMutation(
    linodeId ?? -1,
    manuallyUpdateConfigs ? configs : undefined
  );

  const {
    error: shutdownError,
    isLoading: isShuttingDown,
    mutateAsync: shutdownLinode,
  } = useShutdownLinodeMutation(linodeId ?? -1);

  const { resetEventsPolling } = usePollingInterval();

  const [selectedConfigID, setSelectConfigID] = React.useState<null | number>(
    null
  );

  const mutationMap = {
    'Power Off': shutdownLinode,
    'Power On': bootLinode,
    Reboot: rebootLinode,
  } as const;

  const errorMap = {
    'Power Off': shutdownError,
    'Power On': bootError,
    Reboot: rebootError,
  };

  const loadingMap = {
    'Power Off': isShuttingDown,
    'Power On': isBooting,
    Reboot: isRebooting,
  };

  const error = errorMap[action];
  const isLoading = loadingMap[action];
  const isRebootAction = props.action === 'Reboot';
  const isPowerOnAction = props.action === 'Power On';

  const onSubmit = async () => {
    if (isPowerOnAction || isRebootAction) {
      const mutateAsync = mutationMap[action as 'Power On' | 'Reboot'];
      await mutateAsync({
        config_id: selectedConfigID ?? selectDefaultConfig(configs),
      });
    } else {
      const mutateAsync = mutationMap[action as 'Power Off'];
      await mutateAsync();
    }
    resetEventsPolling();
    onClose();
  };

  const showConfigSelect =
    configs !== undefined &&
    configs?.length > 1 &&
    (isPowerOnAction || isRebootAction);

  const configOptions =
    configs?.map((config) => ({
      label: config.label,
      value: config.id,
    })) ?? [];

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            label: `${props.action} Linode`,
            loading: isLoading,
            onClick: onSubmit,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: props.onClose }}
        />
      }
      sx={{
        '& .dialog-content': {
          paddingBottom: 0,
          paddingTop: 0,
        },
      }}
      error={error?.[0].reason}
      onClose={onClose}
      open={isOpen}
      title={`${action} Linode ${linode?.label ?? ''}?`}
    >
      {isPowerOnAction ? (
        <Typography
          sx={{
            alignItems: 'center',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            marginBottom: theme.spacing(1.25),
          }}
        >
          See the&nbsp;
          <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/set-up-and-secure/">
            guide for setting up and securing a compute instance
          </Link>
          &nbsp;for more information.
        </Typography>
      ) : null}
      {showConfigSelect && (
        <Select
          errorText={configsError?.[0].reason}
          isLoading={configsLoading}
          label="Config"
          onChange={(o) => setSelectConfigID(o === null ? null : o.value)}
          options={configOptions}
          overflowPortal
          value={configOptions.find((o) => o.value === selectedConfigID)}
        />
      )}
      {props.action === 'Power Off' && (
        <span>
          <Notice
            sx={{
              '& .noticeText': {
                fontSize: '0.875rem !important',
              },
            }}
            variant="warning"
          >
            <strong>Note: </strong>
            Powered down Linodes will still accrue charges.
            <br />
            See the&nbsp;
            <Link to="https://www.linode.com/docs/guides/understanding-billing-and-payments/#will-i-be-billed-for-powered-off-or-unused-services">
              Billing and Payments documentation
            </Link>
            &nbsp;for more information.
          </Notice>
        </span>
      )}
    </ConfirmationDialog>
  );
};
