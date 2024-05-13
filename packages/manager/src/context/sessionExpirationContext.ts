import * as React from 'react';

import { DialogContextProps, defaultContext } from './useDialogContext';

export const sessionExpirationContext = React.createContext<DialogContextProps>(
  defaultContext
);
