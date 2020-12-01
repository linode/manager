import { createContext, useCallback, useState } from 'react';

export interface DialogContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const defaultContext = {
  isOpen: false,
  open: () => void 0,
  close: () => void 0
};

export const dialogContext = createContext<DialogContextProps>(defaultContext);

export const useDialogContext = (): DialogContextProps => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  return {
    isOpen,
    open,
    close
  };
};

export default useDialogContext;
