/**
 * The <Prompt /> component is used to prevent transitions when a user has unsaved changes.
 * Internal routes can be prevented using custom components (as render props). Prevention of
 * external route changes (and closing of tabs/windows) is achieved by using an event listener on
 * "beforeunload". The browser controls this prompt, and it is not possible to customize it. Pass
 * in the `confirmWhenLeaving` prop if this behavior is desired.
 *
 * Example usage:
 *
 * ```typescript
 * return (
 *   <Prompt when={hasUnsavedChanges}>
 *     (({ isModalOpen, handleCancel, handleConfirm }) => {
 *       <YourConfirmationComponent
 *         open={isModalOpen}
 *         handleCancel={handleCancel}
 *         handleConfirm={handleConfirm}
 *       />
 *     })
 *   </Prompt>
 * );
 * ```
 */

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
  confirmWhenLeaving?: boolean;
  children: (props: ChildrenProps) => React.ReactNode;
  cancelCallback?: () => void;
}

type CombinedProps = Props;

const Prompt: React.FC<CombinedProps> = (props) => {
  // const { cancelCallback } = props;
  const history = useHistory();

  React.useEffect(() => {
    if (!props.when || !props.confirmWhenLeaving) {
      return;
    }

    // See: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prevent the unload event.
      e.preventDefault();
      // Chrome requires returnValue to be set to a string.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [props.when, props.confirmWhenLeaving]);

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
    if (location.pathname === history.location.pathname) {
      // Sorting order changes affect the search portion of the URL.
      // The path is the same though, so the user isn't actually navigating away.
      return true;
    }
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
