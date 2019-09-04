import { linodeBoot, linodeReboot, linodeShutdown } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

import { resetEventsPolling } from 'src/events';
import LinodeConfigDrawer from 'src/features/LinodeConfigSelectionDrawer';


export type Action = 'Reboot' | 'Power Off' | 'Power On';

interface Props {
  action?: Action;
  linodeID: number;
  linodeLabel: string;
  isOpen: boolean;
  close: () => void;
  /** if a Linode has multiple configs, we need to boot a specific config */
  linodeConfigs?: Linode.Config[];
}

type CombinedProps = Props;

const PowerActionsDialogOrDrawer: React.FC<CombinedProps> = props => {
  const [isTakingAction, setTakingAction] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);
  const [selectedConfigID, selectConfigID] = React.useState<number | undefined>(
    undefined
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
      selectConfigID(undefined);
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
        linodeConfigs={props.linodeConfigs!}
        selectedConfigID={selectedConfigID}
      />
    );
  }

  if (!props.action) {
    return null;
  }

  return (
    <Dialog
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
      <Typography>
        Are you sure you want to {props.action.toLowerCase()} your Linode?
      </Typography>
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
        destructive={
          ['Power On', 'Reboot'].includes(props.action) ? false : true
        }
        buttonType={
          ['Power On', 'Reboot'].includes(props.action)
            ? 'primary'
            : 'secondary'
        }
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
