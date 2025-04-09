import * as React from 'react';

import type { APIError } from '@linode/api-v4/lib/types';

interface OpenCloseState {
  error?: APIError[];
  open: boolean;
}

export interface OpenClose {
  close: () => void;
  isOpen: boolean;
  open: () => void;
}

const defaultState = {
  open: false,
};

// Simple hook to group "open/close" state & functionality.
// Useful for components that render several drawers, modals, etc. which need
// independent open/close state. This hooks provides a common interface.
export const useOpenClose = (
  initialState: OpenCloseState = defaultState,
): OpenClose => {
  const [entity, setEntity] = React.useState<OpenCloseState>(initialState);

  const open = () => setEntity((prevState) => ({ ...prevState, open: true }));
  const close = () => setEntity((prevState) => ({ ...prevState, open: false }));

  const isOpen = entity.open;

  return { close, isOpen, open };
};
