import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';

interface OpenCloseState {
  open: boolean;
  error?: APIError[];
}

export interface OpenClose {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const defaultState = {
  open: false
};

// Simple hook to group "open/close" state & functionality.
// Useful for components that render several drawers, modals, etc. which need
// independent open/close state. This hooks provides a common interface.
export const useOpenClose = (
  initialState: OpenCloseState = defaultState
): OpenClose => {
  const [entity, setEntity] = React.useState<OpenCloseState>(initialState);

  const open = () => setEntity(prevState => ({ ...prevState, open: true }));
  const close = () => setEntity(prevState => ({ ...prevState, open: false }));

  const isOpen = entity.open;

  return { isOpen, open, close };
};

export default useOpenClose;
