import { createContext, useCallback, useState } from 'react';

export interface VLANContextProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const defaultContext = {
  isOpen: false,
  open: () => null,
  close: () => null
};

export const vlanContext = createContext<VLANContextProps>(defaultContext);

export const useVLANContext = (): VLANContextProps => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  return {
    isOpen,
    open,
    close
  };
};
