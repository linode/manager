import * as React from 'react';

import { DialogContextProps, defaultContext } from './useDialogContext';

export const switchAccountSessionContext = React.createContext<DialogContextProps>(
  defaultContext
);
