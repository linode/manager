import { convertMegabytesTo } from 'src/utilities/unitConversions';

import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

/**
 * Filters a list of plans based on the current plan's disk size or the current used disk size.
 *
 * @param {string | undefined} currentPlanID - The ID of the current plan.
 * @param {null | number} currentUsedDiskSize - The current used disk size.
 * @param {PlanSelectionWithDatabaseType[]} types - The list of available plans to filter.
 * @param {boolean} [isNewDatabase] - Optional flag indicating whether the database is new. If true, the filtering logic based on disk usage is applied.
 *
 * @returns {PlanSelectionWithDatabaseType[]} A filtered list of plans based on the conditions:
 *   - If `isNewDatabase` is false and `currentPlanID` is provided, plans with disk sizes smaller or equal to the current plan are included.
 *   - If `isNewDatabase` is true, plans are filtered based on their disk size compared to the current used disk size.
 */
export const isSmallerOrEqualCurrentPlan = (
  currentPlanID: string | undefined,
  currentUsedDiskSize: null | number,
  types: PlanSelectionWithDatabaseType[],
  isNewDatabase?: boolean
) => {
  const currentType = types.find((thisType) => thisType.id === currentPlanID);

  return !isNewDatabase && currentType
    ? types?.filter((type) =>
        type.class === 'dedicated'
          ? type.disk < currentType?.disk
          : type.disk <= currentType?.disk
      )
    : types?.filter(
        (type) =>
          currentUsedDiskSize &&
          currentUsedDiskSize >=
            +convertMegabytesTo(type.disk, true)
              .split(/(GB|MB|KB)/i)[0]
              .trim()
      );
};
