import * as React from 'react';
import { Prompt as ReactRouterPrompt, useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  when: boolean;
}

type CombinedProps = Props;

const Prompt: React.FC<CombinedProps> = props => {
  const history = useHistory();

  const confirmNav = React.useRef<boolean>(false);

  const [nextLocation, setNextLocation] = React.useState<Location | null>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleConfirm = () => {
    setIsOpen(false);
    confirmNav.current = true;
    if (nextLocation) {
      history.push(nextLocation.pathname);
    }
  };

  const handleBlockedNavigation = (_nextLocation: Location) => {
    if (!confirmNav.current) {
      setIsOpen(true);
      setNextLocation(_nextLocation);
      return false;
    }

    return true;
  };

  return (
    <>
      <ReactRouterPrompt {...props} message={handleBlockedNavigation as any} />;
      <ConfirmationModal
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
        handleConfirm={handleConfirm}
      />
    </>
  );
};
export default Prompt;

interface ConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = props => {
  const { isOpen, handleClose, handleConfirm } = props;

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleConfirm}>
        Leave and discard changes
      </Button>

      <Button buttonType="primary" onClick={handleClose}>
        Go back and review changes
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={isOpen}
      onClose={() => handleClose()}
      title="Discard Firewall changes?"
      actions={actions}
    >
      <Typography variant="subtitle1">
        The changes you made to this Firewall haven't been applied. If you
        navigate away from this page, your changes will be discarded.
      </Typography>
    </ConfirmationDialog>
  );
};
