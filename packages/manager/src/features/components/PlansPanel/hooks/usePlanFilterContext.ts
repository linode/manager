/**
 * usePlanFilterContext Hook
 *
 * Hook to access the plan filter context.
 * Must be used within a PlanFilterProvider.
 */

import * as React from 'react';

import { PlanFilterContext } from '../PlanFilterContext';

import type { PlanFilterContextValue } from '../PlanFilterContext';

export const usePlanFilterContext = (): PlanFilterContextValue => {
  const context = React.useContext(PlanFilterContext);

  if (context === undefined) {
    throw new Error(
      'usePlanFilterContext must be used within a PlanFilterProvider'
    );
  }

  return context;
};
