import Factory from 'src/factories/factoryProxy';

import type {
  Incident,
  IncidentPage,
  IncidentResponse,
  IncidentUpdate,
  Maintenance,
  MaintenanceResponse,
} from 'src/queries/statusPage';

const DATE = '2021-01-12T00:00:00.394Z';

export const pageFactory = Factory.Sync.makeFactory<IncidentPage>({
  id: Factory.each((i) => String(i)),
  name: 'Linode',
  time_zone: 'Etc/UTC',
  updated_at: DATE,
  url: 'https://status.linode.com',
});

export const incidentUpdateFactory = Factory.Sync.makeFactory<IncidentUpdate>({
  affected_components: [
    {
      code: crypto.randomUUID(),
      name:
        'Linode Kubernetes Engine - US-East (Newark) Linode Kubernetes Engine',
      new_status: 'major_outage',
      old_status: 'operational',
    },
  ],
  body:
    'Our team is investigating an issue affecting the Linode Kubernetes Engine (LKE) in Newark. We will share additional updates as we have more information.',
  created_at: DATE,
  custom_tweet: null,
  deliver_notifications: true,
  display_at: DATE,
  id: Factory.each((i) => String(i)),
  incident_id: crypto.randomUUID(),
  status: 'investigating',
  tweet_id: Math.floor(Math.random() * 1000000),
  updated_at: DATE,
});

export const incidentFactory = Factory.Sync.makeFactory<Incident>({
  created_at: DATE,
  id: Factory.each((i) => String(i)),
  impact: 'critical',
  incident_updates: incidentUpdateFactory.buildList(5),
  monitoring_at: DATE,
  name: 'Service Issue - Linode Kubernetes Engine',
  page_id: crypto.randomUUID(),
  resolved_at: DATE,
  shortlink: 'https://stspg.io/gm27wxnn653m',
  started_at: DATE,
  status: 'investigating',
  updated_at: DATE,
});

export const incidentResponseFactory = Factory.Sync.makeFactory<IncidentResponse>(
  {
    incidents: [
      incidentFactory.build({
        impact: 'major',
        incident_updates: incidentUpdateFactory.buildList(4, {
          body: `Our team is investigating a connectivity issue in our Mumbai data center.
          During this time, users may experience connection timeouts and errors for all services
          deployed in this data center. We will share additional updates as we have more information.`,
        }),
        name: 'Connectivity Issue - AP-West (Mumbai)',
        status: 'monitoring',
      }),
      incidentFactory.build({ impact: 'critical' }),
    ],
    page: pageFactory.build(),
  }
);

export const maintenanceFactory = Factory.Sync.makeFactory<Maintenance>({
  created_at: DATE,
  id: Factory.each((i) => String(i)),
  impact: 'maintenance' as any,
  incident_updates: incidentUpdateFactory.buildList(2),
  monitoring_at: DATE,
  name: 'Scheduled Network Maintenance - US-East (Newark)',
  page_id: '8dn0wstr1chc',
  resolved_at: DATE,
  shortlink: 'https://stspg.io/0plrpbwg6h64',
  started_at: DATE,
  status: 'scheduled',
  updated_at: DATE,
});

export const maintenanceResponseFactory = Factory.Sync.makeFactory<MaintenanceResponse>(
  {
    page: pageFactory.build(),
    scheduled_maintenances: [
      maintenanceFactory.build({
        id: 'test001',
        incident_updates: [
          incidentUpdateFactory.build({
            // eslint-disable-next-line xss/no-mixed-html
            body:
              'The Linode Cloud Manager, API, and CLI will be offline for internal upgrades and maintenance on Thursday, September 23rd, 2021, from 7PM until 10PM EDT (23:00 to 02:00 UTC). During this window, running Linodes and related services will <b>not</b> be disrupted, but account management access and support tickets will be unavailable.',
          }),
        ],
        name:
          'Cloud Manager and API Downtime on September 23, 2021 for 3-hour window',
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
