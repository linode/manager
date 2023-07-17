import { registerSelectors } from 'reselect-tools';

import entitiesLoading from './entitiesLoading';

/** Note: We could simplify this boilerplate if we had a rule that each selector file
 * could contain only one export (the selector itself).
 */

export const initReselectDevtools = () => {
  registerSelectors({
    entitiesLoading,
  });
};
