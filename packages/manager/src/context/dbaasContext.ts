import * as React from 'react';
import { defaultContext, DialogContextProps } from './useDialogContext';

export const dbaasContext = React.createContext<DialogContextProps>(
  defaultContext
);
