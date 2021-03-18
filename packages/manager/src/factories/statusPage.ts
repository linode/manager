import * as Factory from 'factory.ts';
import {
  Incident,
  IncidentPage,
  IncidentResponse,
  IncidentUpdate,
  Maintenance,
  MaintenanceResponse,
} from 'src/queries/statusPage';
import { v4 } from 'uuid';

const DATE = '2021-01-12T00:00:00.394Z';

export const pageFactory = Factory.Sync.makeFactory<IncidentPage>({
  id: Factory.each((i) => String(i)),
  name: 'Linode',
  url: 'https://status.linode.com',
  time_zone: 'Etc/UTC',
  updated_at: DATE,
});

export const incidentUpdateFactory = Factory.Sync.makeFactory<IncidentUpdate>({
  id: Factory.each((i) => String(i)),
  status: 'investigating',
  body:
    'Our team is investigating an issue affecting the Linode Kubernetes Engine (LKE) in Newark. We will share additional updates as we have more information.',
  incident_id: v4(),
  created_at: DATE,
  updated_at: DATE,
  display_at: DATE,
  affected_components: [
    {
      code: v4(),
      name:
        'Linode Kubernetes Engine - US-East (Newark) Linode Kubernetes Engine',
      old_status: 'operational',
      new_status: 'major_outage',
    },
  ],
  deliver_notifications: true,
  custom_tweet: null,
  tweet_id: Math.floor(Math.random() * 1000000),
});

export const incidentFactory = Factory.Sync.makeFactory<Incident>({
  id: Factory.each((i) => String(i)),
  name: 'Service Issue - Linode Kubernetes Engine',
  status: 'investigating',
  created_at: DATE,
  updated_at: DATE,
  monitoring_at: DATE,
  resolved_at: DATE,
  impact: 'critical',
  shortlink: 'https://stspg.io/gm27wxnn653m',
  started_at: DATE,
  page_id: v4(),
  incident_updates: incidentUpdateFactory.buildList(5),
});

export const maintenanceFactory = incidentFactory.extend({
  status: 'scheduled' as any,
});

export const incidentResponseFactory = Factory.Sync.makeFactory<IncidentResponse>(
  {
    page: pageFactory.build(),
    incidents: incidentFactory.buildList(5),
  }
);

export const maintenanceResponseFactory = Factory.Sync.makeFactory<MaintenanceResponse>(
  {
    page: pageFactory.build(),
    scheduled_maintenances: (maintenanceFactory.buildList(
      5
    ) as unknown) as Maintenance[],
  }
);
