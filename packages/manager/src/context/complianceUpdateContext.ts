import * as React from 'react';

import { defaultContext } from './useDialogContext';

import type { DialogContextProps } from './useDialogContext';

export const complianceUpdateContext =
  React.createContext<DialogContextProps>(defaultContext);
