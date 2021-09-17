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

export const incidentResponseFactory = Factory.Sync.makeFactory<IncidentResponse>(
  {
    page: pageFactory.build(),
    incidents: [
      incidentFactory.build({
        impact: 'major',
        status: 'monitoring',
        name: 'Connectivity Issue - AP-West (Mumbai)',
        incident_updates: incidentUpdateFactory.buildList(4, {
          body: `Our team is investigating a connectivity issue in our Mumbai data center. 
          During this time, users may experience connection timeouts and errors for all services 
          deployed in this data center. We will share additional updates as we have more information.`,
        }),
      }),
      incidentFactory.build({ impact: 'critical' }),
    ],
  }
);

export const maintenanceFactory = Factory.Sync.makeFactory<Maintenance>({
  id: Factory.each((i) => String(i)),
  name: 'Scheduled Network Maintenance - US-East (Newark)',
  status: 'scheduled',
  created_at: DATE,
  updated_at: DATE,
  monitoring_at: DATE,
  resolved_at: DATE,
  impact: 'maintenance' as any,
  shortlink: 'https://stspg.io/0plrpbwg6h64',
  started_at: DATE,
  page_id: '8dn0wstr1chc',
  incident_updates: incidentUpdateFactory.buildList(2),
});

export const maintenanceResponseFactory = Factory.Sync.makeFactory<MaintenanceResponse>(
  {
    page: pageFactory.build(),
    scheduled_maintenances: [
      maintenanceFactory.build({
        id: 'test001',
        name:
          'Cloud Manager and API Downtime on September 23, 2021 for 3-hour window',
        incident_updates: [
          incidentUpdateFactory.build({
            // eslint-disable-next-line xss/no-mixed-html
            body:
              'The Linode Cloud Manager, API, and CLI will be offline for internal upgrades and maintenance on Thursday, September 23rd, 2021, from 7PM until 10PM EDT (23:00 to 02:00 UTC). During this window, running Linodes and related services will <b>not</b> be disrupted, but account management access and support tickets will be unavailable.',
          }),
        ],
      }),
      // maintenanceFactory.build({
      //   id: 'test002',
      //   name:
      //     'Cloud Manager and API Downtime on December 23, 2021 for 5-hour window',
      //   incident_updates: [
      //     incidentUpdateFactory.build({
      //       // eslint-disable-next-line xss/no-mixed-html
      //       body:
      //         'The Linode Cloud Manager, API, and CLI will be offline for internal upgrades and maintenance on December 23rd, 2021, from 6PM until 11PM EDT. During this window, running Linodes and related services will <b>not</b> be disrupted, but account management access and support tickets will be unavailable.',
      //     }),
      //   ],
      // }),
    ],
  }
);
