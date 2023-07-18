import { Config } from '@linode/api-v4/lib/linodes';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Select from 'src/components/EnhancedSelect/Select';
import ExternalLink from 'src/components/ExternalLink';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useEventsInfiniteQuery } from 'src/queries/events';
import {
  useAllLinodeConfigsQuery,
  useBootLinodeMutation,
  useLinodeQuery,
  useRebootLinodeMutation,
  useShutdownLinodeMutation,
} from 'src/queries/linodes/linodes';

export type Action = 'Power Off' | 'Power On' | 'Reboot';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    '& .dialog-content': {
      paddingBottom: 0,
      paddingTop: 0,
    },
  },
  notice: {
    '& .noticeText': {
      fontSize: '0.875rem !important',
    },
  },
  root: {
    alignItems: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    marginBottom: theme.spacing(1.25),
  },
}));

interface Props {
  action: Action;
  isOpen: boolean;
  linodeId: number | undefined;
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
  const { action, isOpen, linodeId, onClose } = props;
  const classes = useStyles();

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
  } = useBootLinodeMutation(linodeId ?? -1);

  const {
    error: rebootError,
    isLoading: isRebooting,
    mutateAsync: rebootLinode,
  } = useRebootLinodeMutation(linodeId ?? -1);

  const {
    error: shutdownError,
    isLoading: isShuttingDown,
    mutateAsync: shutdownLinode,
  } = useShutdownLinodeMutation(linodeId ?? -1);

  const { resetEventsPolling } = useEventsInfiniteQuery({ enabled: false });

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

  const onSubmit = async () => {
    if (props.action === 'Power On' || props.action === 'Reboot') {
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
    (props.action === 'Power On' || props.action === 'Reboot');

  const configOptions =
    configs?.map((config) => ({
      label: config.label,
      value: config.id,
    })) ?? [];

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={props.onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" loading={isLoading} onClick={onSubmit}>
            {props.action} Linode
          </Button>
        </ActionsPanel>
      }
      className={classes.dialog}
      error={error?.[0].reason}
      onClose={onClose}
      open={isOpen}
      title={`${action} Linode ${linode?.label ?? ''}?`}
    >
      {props.action === 'Power On' ? (
        <Typography className={classes.root}>
          See the&nbsp;
          <ExternalLink
            hideIcon
            link="https://www.linode.com/docs/products/compute/compute-instances/guides/set-up-and-secure/"
            text="guide for setting up and securing a compute instance"
          />
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
          <Notice className={classes.notice} warning>
            <strong>Note: </strong>
            Powered down Linodes will still accrue charges.
            <br />
            See the&nbsp;
            <ExternalLink
              hideIcon
              link="https://www.linode.com/docs/guides/understanding-billing-and-payments/#will-i-be-billed-for-powered-off-or-unused-services"
              text="Billing and Payments documentation"
            />
            &nbsp;for more information.
          </Notice>
        </span>
      )}
    </ConfirmationDialog>
  );
};
