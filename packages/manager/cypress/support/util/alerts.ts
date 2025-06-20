import {
  alertFactory,
  alertRulesFactory,
  databaseFactory,
} from 'src/factories';

import type { Database, Region } from '@linode/api-v4';

export const getAlertsforRegion = (regions: Region[]) => {
  const databases: Database[] = databaseFactory
    .buildList(5)
    .map((db, index) => ({
      ...db,
      engine: 'mysql',
      region: regions[index % regions.length].id,
      type: 'MySQL',
    }));

  const alertDetails = alertFactory.build({
    entity_ids: databases.slice(0, 4).map((db) => db.id.toString()),
    rule_criteria: { rules: alertRulesFactory.buildList(2) },
    service_type: 'dbaas',
    severity: 1,
    status: 'enabled',
    type: 'user',
    created_by: 'user1',
    updated_by: 'user2',
    created: '2023-10-01T12:00:00Z',
    updated: new Date().toISOString(),
  });

  return {
    databases,
    alertDetails,
  };
};
