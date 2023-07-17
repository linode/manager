import * as React from 'react';

import { DialogContextProps, defaultContext } from './useDialogContext';

export const complianceUpdateContext = React.createContext<DialogContextProps>(
  defaultContext
);
