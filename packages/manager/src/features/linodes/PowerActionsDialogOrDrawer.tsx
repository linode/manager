import {
  Config,
  linodeBoot,
  linodeReboot,
  linodeShutdown
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Notice from 'src/components/Notice';

import { makeStyles, Theme } from 'src/components/core/styles';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';

import { resetEventsPolling } from 'src/eventsPolling';
import LinodeConfigDrawer from 'src/features/LinodeConfigSelectionDrawer';

export type Action = 'Reboot' | 'Power Off' | 'Power On';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(1.25),
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.25rem',
    fontSize: '0.875rem'
  },
  dialog: {
    '& .dialog-content': {
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  notice: {
    '& .noticeText': {
      fontSize: '0.875rem !important'
    }
  }
}));

interface Props {
  action?: Action;
  linodeID: number;
  linodeLabel: string;
  isOpen: boolean;
  close: () => void;
  /** if a Linode has multiple configs, we need to boot a specific config */
  linodeConfigs?: Config[];
}

type CombinedProps = Props;

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

const PowerActionsDialogOrDrawer: React.FC<CombinedProps> = props => {
  const { linodeConfigs } = props;
  const classes = useStyles();
  const [isTakingAction, setTakingAction] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [selectedConfigID, selectConfigID] = React.useState<number | undefined>(
    selectDefaultConfig(linodeConfigs)
  );

  const hasMoreThanOneConfigOnSelectedLinode =
    !!props.linodeConfigs && props.linodeConfigs.length > 1;

  React.useEffect(() => {
    if (props.isOpen) {
      /**
       * reset error and loading state when we open the modal
       */
      setErrors(undefined);
      setTakingAction(false);
      selectConfigID(selectDefaultConfig(linodeConfigs));
    }
  }, [props.isOpen]);

  const handleSubmit = () => {
    /** this will never happen but handle gracefully */
    if (!props.action || !props.linodeID) {
      return setErrors([{ reason: 'An unexpected error occurred.' }]);
    }

    /** throw an error if we have need to select a config and haven't */
    if (
      hasMoreThanOneConfigOnSelectedLinode &&
      ((props.action === 'Power On' && !selectedConfigID) ||
        (props.action === 'Reboot' && !selectedConfigID))
    ) {
      /** force the user into selecting a config when they boot */
      return setErrors([
        { reason: 'Please select a Config Profile to boot with.' }
      ]);
    }

    setTakingAction(true);
    determineBootPromise(props.action)(props.linodeID, selectedConfigID)
      .then(() => {
        resetEventsPolling();
        props.close();
      })
      .catch(e => {
        setTakingAction(false);
        setErrors(e);
      });
  };

  /**
   * if we're rebooting or booting a Linode with many configs, we need the user to
   * confirm which config they actually want to boot, rather than
   * confirming the action with a dialog message.
   */
  if (
    (props.action === 'Power On' && hasMoreThanOneConfigOnSelectedLinode) ||
    (props.action === 'Reboot' && hasMoreThanOneConfigOnSelectedLinode)
  ) {
    return (
      <LinodeConfigDrawer
        loading={isTakingAction}
        error={errors}
        isOpen={props.isOpen}
        onSelectConfig={selectConfigID}
        onSubmit={handleSubmit}
        onClose={props.close}
        linodeConfigs={props.linodeConfigs ?? []}
        selectedConfigID={selectedConfigID}
      />
    );
  }

  if (!props.action) {
    return null;
  }

  return (
    <Dialog
      className={classes.dialog}
      open={props.isOpen}
      title={`Are you sure you want to ${props.action.toLowerCase()} ${
        props.linodeLabel
      }?`}
      onClose={props.close}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.close}
          loading={isTakingAction}
          onSubmit={handleSubmit}
          action={props.action}
        />
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
              link="https://www.linode.com/docs/platform/billing-and-support/how-linode-billing-works/#if-my-linode-is-powered-off-will-i-be-billed"
              text="Billing and Payments documentation"
              hideIcon
            />
            &nbsp;for more information.
          </Notice>
        </span>
      )}
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  action: Action;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.loading}
        buttonType="primary"
      >
        {props.action}
      </Button>
    </ActionsPanel>
  );
};

const determineBootPromise = (action: Action) => {
  switch (action) {
    case 'Reboot':
      return linodeReboot;
    case 'Power On':
      return linodeBoot;
    case 'Power Off':
      return linodeShutdown;
    default:
      return linodeReboot;
  }
};

export default compose<CombinedProps, Props>(React.memo)(
  PowerActionsDialogOrDrawer
);
