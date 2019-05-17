import { registerSelectors } from 'reselect-tools';

import entityErrors from './entitiesErrors';
import entitiesLoading from './entitiesLoading';
import getAbuseTicket from './getAbuseTicket';
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
    entityErrors,
    entitiesLoading,
    getAbuseTicket,
    getEntitiesWithGroupsToImport,
    getSearchEntities,
    inProgressEventForLinode,
    inProgressEvents,
    recentEventForLinode
  });
};
