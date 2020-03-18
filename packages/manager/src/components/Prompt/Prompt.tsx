import { Location } from 'history';
import * as React from 'react';
import { Prompt as ReactRouterPrompt, useHistory } from 'react-router-dom';

interface ChildrenProps {
  isModalOpen: boolean;
  handleCancel: () => void;
  handleConfirm: () => void;
}

interface Props {
  when: boolean;
  children: (props: ChildrenProps) => React.ReactNode;
}

type CombinedProps = Props;

const Prompt: React.FC<CombinedProps> = props => {
  const history = useHistory();

  // Whether or not the user has confirmed navigation.
  const confirmedNav = React.useRef<boolean>(false);

  // The location the user is navigating to.
  const [nextLocation, setNextLocation] = React.useState<Location | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const handleCancel = () => setIsModalOpen(false);

  const handleConfirm = () => {
    setIsModalOpen(false);

    if (!nextLocation) {
      return;
    }

    // Set confirmedNav to `true`, which will allow navigation in `handleNavigation()`.
    confirmedNav.current = true;
    history.push(nextLocation.pathname);
  };

  const handleNavigation = (location: Location) => {
    // If this user hasn't yet confirmed navigation, present a confirmation modal.
    if (!confirmedNav.current) {
      setIsModalOpen(true);
      // We need to set the requested location as well.
      setNextLocation(location);
      return false;
    }
    // The user has confirmed navigation, so we allow it.
    return true;
  };

  return (
    <>
      <ReactRouterPrompt when={props.when} message={handleNavigation} />
      {props.children({ isModalOpen, handleCancel, handleConfirm })}
    </>
  );
};
export default React.memo(Prompt);
