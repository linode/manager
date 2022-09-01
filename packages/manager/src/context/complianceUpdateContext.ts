import * as React from 'react';
import { defaultContext, DialogContextProps } from './useDialogContext';

export const complianceUpdateContext = React.createContext<DialogContextProps>(
  defaultContext
);
