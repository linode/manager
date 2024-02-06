import { useCallback, useState } from 'react';

export interface DialogContextProps {
  [key: string]:
    | (() => void)
    | ((newState: UseDialogContextOptions) => void)
    | boolean;
  close: () => void;
  isOpen: boolean;
  open: () => void;
  updateState: (newState: UseDialogContextOptions) => void;
}

export type UseDialogContextOptions = {
  [key: string]: boolean;
};

export const defaultContext: DialogContextProps = {
  close: () => void 0,
  isOpen: false,
  open: () => void 0,
  updateState: () => void 0,
};

export const useDialogContext = (
  initialState: UseDialogContextOptions = {}
): DialogContextProps => {
  const [state, setState] = useState({ ...defaultContext, ...initialState });

  // TODO: We no longer need the open and close functions after we update other references
  const open = useCallback(
    () => setState((prevState) => ({ ...prevState, isOpen: true })),
    []
  );
  const close = useCallback(
    () => setState((prevState) => ({ ...prevState, isOpen: false })),
    []
  );
  const updateState = useCallback(
    (newState: UseDialogContextOptions) =>
      setState((prevState) => ({ ...prevState, ...newState })),
    []
  );

  return {
    ...state,
    close,
    open,
    updateState,
  };
};
