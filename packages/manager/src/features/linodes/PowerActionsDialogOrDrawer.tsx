import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import {
  // useAllLinodeConfigsQuery,
  useBootLinodeMutation,
  useLinodeQuery,
  useRebootLinodeMutation,
  useShutdownLinodeMutation,
} from 'src/queries/linodes/linodes';

export type Action = 'Reboot' | 'Power Off' | 'Power On';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(1.25),
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.25rem',
    fontSize: '0.875rem',
  },
  dialog: {
    '& .dialog-content': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  notice: {
    '& .noticeText': {
      fontSize: '0.875rem !important',
    },
  },
}));

interface Props {
  linodeId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
  action: Action;
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

export const PowerActionsDialogOrDrawer = (props: Props) => {
  const { onClose, linodeId, isOpen, action } = props;
  const classes = useStyles();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );
  // const { data: configs } = useAllLinodeConfigsQuery(
  //   linodeId ?? -1,
  //   linodeId !== undefined
  // );

  const {
    mutateAsync: bootLinode,
    isLoading: isBooting,
    error: bootError,
  } = useBootLinodeMutation(linodeId ?? -1);

  const {
    mutateAsync: rebootLinode,
    isLoading: isRebooting,
    error: rebootError,
  } = useRebootLinodeMutation(linodeId ?? -1);

  const {
    mutateAsync: shutdownLinode,
    isLoading: isShuttingDown,
    error: shutdownError,
  } = useShutdownLinodeMutation(linodeId ?? -1);

  // const [selectedConfigID, selectConfigID] = React.useState<number | undefined>();

  // const hasMoreThanOneConfig = configs && configs.length > 1;

  const mutationMap = {
    Reboot: rebootLinode,
    'Power Off': shutdownLinode,
    'Power On': bootLinode,
  };

  const errorMap = {
    Reboot: rebootError,
    'Power Off': shutdownError,
    'Power On': bootError,
  };

  const loadingMap = {
    Reboot: isRebooting,
    'Power Off': isShuttingDown,
    'Power On': isBooting,
  };

  const mutateAsync = mutationMap[action];
  const error = errorMap[action];
  const isLoading = loadingMap[action];

  const onSubmit = async () => {
    await mutateAsync();
    onClose();
  };

  return (
    <ConfirmationDialog
      className={classes.dialog}
      open={isOpen}
      title={`${action} Linode ${linode?.label}?`}
      onClose={onClose}
      error={error?.[0].reason}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={props.onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" onClick={onSubmit} loading={isLoading}>
            {props.action} Linode
          </Button>
        </ActionsPanel>
      }
    >
      <Typography className={classes.root}>
        Are you sure you want to {props.action.toLowerCase()} your Linode?
      </Typography>
      {props.action === 'Power Off' && (
        <span>
          <Notice warning important className={classes.notice}>
            <strong>Note: </strong>
            Powered down Linodes will still accrue charges. See the&nbsp;
            <ExternalLink
              link="https://www.linode.com/docs/guides/understanding-billing-and-payments/#will-i-be-billed-for-powered-off-or-unused-services"
              text="Billing and Payments documentation"
              hideIcon
            />
            &nbsp;for more information.
          </Notice>
        </span>
      )}
    </ConfirmationDialog>
  );
};

export default PowerActionsDialogOrDrawer;
