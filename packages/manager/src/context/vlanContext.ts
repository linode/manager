import * as React from 'react';
import { defaultContext, DialogContextProps } from './useDialogContext';

export const vlanContext = React.createContext<DialogContextProps>(
  defaultContext
);
