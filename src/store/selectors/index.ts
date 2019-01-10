import { registerSelectors } from 'reselect-tools';

import entitiesLoading from './entitiesLoading';
import getEntitiesWithGroupsToImport from './getEntitiesWithGroupsToImport';
import getSearchEntities from './getSearchEntities';
import inProgressEventForLinode from './inProgressEventForLinode';
import inProgressEvents from './inProgressEvents';
import recentEventForLinode from './recentEventForLinode';


/** Note: We could simplify this boilerplate if we had a rule that each selector file
 * could contain only one export (the selector itself).
 */

 export const initReselectDevtools = () => {
  registerSelectors({
    entitiesLoading,
    getEntitiesWithGroupsToImport,
    getSearchEntities,
    inProgressEventForLinode,
    inProgressEvents,
    recentEventForLinode,
  });
 }

