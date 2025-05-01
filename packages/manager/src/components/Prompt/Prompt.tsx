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

import * as React from 'react';
import { Prompt as ReactRouterPrompt, useHistory } from 'react-router-dom';
import type {
  PromptProps as ReactRouterPromptProps,
  useLocation,
} from 'react-router-dom';

interface ChildrenProps {
  handleCancel: () => void;
  handleConfirm: () => void;
  isModalOpen: boolean;
}

interface PromptProps {
  children: (props: ChildrenProps) => React.ReactNode;
  confirmWhenLeaving?: boolean;
  onConfirm?: (path: string) => void;
  when: boolean;
}

// See: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  // Prevent the unload event.
  e.preventDefault();
  // Chrome requires returnValue to be set to a string.
  e.returnValue = '';
};

export const Prompt = React.memo((props: PromptProps) => {
  const history = useHistory();

  React.useEffect(() => {
    if (!props.when || !props.confirmWhenLeaving) {
      return;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [props.when, props.confirmWhenLeaving]);

  // Whether or not the user has confirmed navigation.
  const confirmedNav = React.useRef<boolean>(false);

  // The location the user is navigating to.
  const [nextLocation, setNextLocation] = React.useState<null | ReturnType<
    typeof useLocation
  >>(null);

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const handleCancel = () => setIsModalOpen(false);

  const handleConfirm = () => {
    setIsModalOpen(false);

    if (!nextLocation) {
      return;
    }

    // Set confirmedNav to `true`, which will allow navigation in `handleNavigation()`.
    confirmedNav.current = true;

    window.removeEventListener('beforeunload', handleBeforeUnload);

    if (props.onConfirm) {
      return props.onConfirm(nextLocation.pathname);
    }

    history.push(nextLocation.pathname);
  };

  const handleNavigation: ReactRouterPromptProps['message'] = (location) => {
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
      <ReactRouterPrompt message={handleNavigation} when={props.when} />
      {props.children({ handleCancel, handleConfirm, isModalOpen })}
    </>
  );
});
