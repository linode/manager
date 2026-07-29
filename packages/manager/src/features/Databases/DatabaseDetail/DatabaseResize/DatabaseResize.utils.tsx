import { convertMegabytesTo } from '@akamai/compute-ui-core/api';

import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

/**
 * Filters a list of plans based on the current plan's disk size or the current used disk size.
 *
 * @param {string | undefined} currentPlanID - The ID of the current plan.
 * @param {null | number} currentUsedDiskSize - The current used disk size.
 * @param {PlanSelectionWithDatabaseType[]} types - The list of available plans to filter.
 *
 * @returns {PlanSelectionWithDatabaseType[]} A filtered list of plans based on their disk size compared to the current used disk size
 */
export const isSmallerOrEqualCurrentPlan = (
  currentPlanID: string | undefined,
  currentUsedDiskSize: null | number,
  types: PlanSelectionWithDatabaseType[]
) => {
  return types?.filter(
    (type) =>
      currentUsedDiskSize &&
      currentUsedDiskSize >=
        +convertMegabytesTo(type.disk, true)
          .split(/(GB|MB|KB)/i)[0]
          .trim()
  );
};
