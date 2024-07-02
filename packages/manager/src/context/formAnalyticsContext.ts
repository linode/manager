import * as React from 'react';

import { defaultContext } from './useFormAnalyticsContext';

import type { FormAnalyticsContextProps } from './useFormAnalyticsContext';

// TODO: does it work to have one formAnalytics context or would we need one per form?
export const formAnalyticsContext = React.createContext<FormAnalyticsContextProps>(
  defaultContext
);
