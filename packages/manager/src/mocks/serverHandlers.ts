import { rest, RequestHandler } from 'msw';

import {
  // abuseTicketNotificationFactory,
  accountFactory,
  appTokenFactory,
  creditPaymentResponseFactory,
  databaseFactory,
  domainFactory,
  domainRecordFactory,
  imageFactory,
  firewallFactory,
  firewallDeviceFactory,
  kubernetesAPIResponse,
  kubeEndpointFactory,
  invoiceFactory,
  invoiceItemFactory,
  nodePoolFactory,
  linodeConfigFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  longviewActivePlanFactory,
  longviewClientFactory,
  longviewSubscriptionFactory,
  managedStatsFactory,
  monitorFactory,
  nodeBalancerFactory,
  notificationFactory,
  objectStorageBucketFactory,
  objectStorageClusterFactory,
  profileFactory,
  supportReplyFactory,
  supportTicketFactory,
  volumeFactory,
  accountTransferFactory,
  eventFactory,
  tagFactory,
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  VLANFactory
} from 'src/factories';

import cachedRegions from 'src/cachedData/regions.json';
import { MockData } from 'src/dev-tools/mockDataController';
import cachedTypes from 'src/cachedData/types.json';

export const makeResourcePage = (
  e: any[],
  override: { page: number; pages: number; results?: number } = {
    page: 1,
    pages: 1
  }
) => ({
  page: override.page ?? 1,
  pages: override.pages ?? 1,
  results: override.results ?? e.length,
  data: e
});

export const handlers = [
  rest.get('*/profile', (req, res, ctx) => {
    const profile = profileFactory.build();
    return res(ctx.json(profile));
  }),
  rest.put('*/profile', (req, res, ctx) => {
    return res(ctx.json({ ...profileFactory.build(), ...(req.body as any) }));
  }),
  rest.get('*/profile/apps', (req, res, ctx) => {
    const tokens = appTokenFactory.buildList(5);
    return res(ctx.json(makeResourcePage(tokens)));
  }),
  rest.get('*/regions', async (req, res, ctx) => {
    return res(ctx.json(cachedRegions));
  }),
  rest.get('*/linode/types', async (req, res, ctx) => {
    return res(ctx.json(cachedTypes));
  }),
  rest.get('*/images', async (req, res, ctx) => {
    const privateImages = imageFactory.buildList(0);
    const publicImages = imageFactory.buildList(0, { is_public: true });
    const images = [...privateImages, ...publicImages];
    return res(ctx.json(makeResourcePage(images)));
  }),
  rest.get('*/linode/instances', async (req, res, ctx) => {
    const onlineLinodes = linodeFactory.buildList(3, {
      backups: { enabled: false },
      ipv4: ['000.000.000.000']
    });
    const offlineLinodes = linodeFactory.buildList(1, { status: 'offline' });
    const busyLinodes = linodeFactory.buildList(5, { status: 'migrating' });
    const eventLinode = linodeFactory.build({
      id: 999,
      status: 'rebooting',
      label: 'eventful'
    });
    const multipleIPLinode = linodeFactory.build({
      label: 'multiple-ips',
      ipv4: [
        '192.168.0.0',
        '192.168.0.1',
        '192.168.0.2',
        '192.168.0.3',
        '192.168.0.4',
        '192.168.0.5'
      ],
      tags: ['test1', 'test2', 'test3']
    });
    const linodes = [
      ...onlineLinodes,
      ...offlineLinodes,
      ...busyLinodes,
      linodeFactory.build({
        label: 'shadow-plan',
        type: 'g5-standard-20-s1',
        backups: { enabled: false }
      }),
      linodeFactory.build({
        label: 'shadow-plan-with-tags',
        type: 'g5-standard-20-s1',
        backups: { enabled: false },
        tags: ['test1', 'test2', 'test3']
      }),
      eventLinode,
      multipleIPLinode
    ];
    return res(ctx.json(makeResourcePage(linodes)));
  }),
  rest.delete('*/instances/*', async (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/instances/*/configs', async (req, res, ctx) => {
    const configs = linodeConfigFactory.buildList(3);
    return res(ctx.json(makeResourcePage(configs)));
  }),
  rest.get('*/instances/*/disks', async (req, res, ctx) => {
    const disks = linodeDiskFactory.buildList(3);
    return res(ctx.json(makeResourcePage(disks)));
  }),
  rest.get('*/instances/*/transfer', async (req, res, ctx) => {
    const transfer = linodeTransferFactory.build();
    return res(ctx.json(transfer));
  }),
  rest.get('*/instances/*/stats', async (req, res, ctx) => {
    const stats = linodeStatsFactory.build();
    return res(ctx.json(stats));
  }),
  rest.get('*/instances/*/ips', async (req, res, ctx) => {
    const ips = linodeIPFactory.build();
    return res(ctx.json(ips));
  }),
  rest.post('*/instances', async (req, res, ctx) => {
    const payload = req.body as any;
    const linode = linodeFactory.build({
      label: payload?.label ?? 'new-linode',
      type: payload?.type ?? 'g6-standard-1',
      image: payload?.image ?? 'linode/debian-10',
      region: payload?.region ?? 'us-east'
    });
    return res(ctx.json(linode));
  }),
  rest.get('*/lke/clusters', async (req, res, ctx) => {
    const clusters = kubernetesAPIResponse.buildList(10);
    return res(ctx.json(makeResourcePage(clusters)));
  }),
  rest.get('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const cluster = kubernetesAPIResponse.build({ id, k8s_version: '1.16' });
    return res(ctx.json(cluster));
  }),
  rest.put('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const k8s_version = req.params.k8s_version;
    const cluster = kubernetesAPIResponse.build({ id, k8s_version });
    return res(ctx.json(cluster));
  }),
  rest.get('*/lke/clusters/:clusterId/pools', async (req, res, ctx) => {
    const pools = nodePoolFactory.buildList(10);
    nodePoolFactory.resetSequenceNumber();
    return res(ctx.json(makeResourcePage(pools)));
  }),
  rest.get('*/lke/clusters/*/api-endpoints', async (req, res, ctx) => {
    const endpoints = kubeEndpointFactory.buildList(2);
    return res(ctx.json(makeResourcePage(endpoints)));
  }),
  rest.get('*/lke/clusters/*/recycle', async (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/firewalls/', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(0);
    return res(ctx.json(makeResourcePage(firewalls)));
  }),
  rest.get('*/firewalls/*/devices', (req, res, ctx) => {
    const devices = firewallDeviceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(devices)));
  }),
  rest.put('*/firewalls/:firewallId', (req, res, ctx) => {
    const firewall = firewallFactory.build({
      status: req.body?.['status'] ?? 'disabled'
    });
    return res(ctx.json(firewall));
  }),
  rest.post('*/firewalls', (req, res, ctx) => {
    const payload = req.body as any;
    const newFirewall = firewallFactory.build({
      label: payload.label ?? 'mock-firewall'
    });
    return res(ctx.json(newFirewall));
  }),
  rest.get('*/nodebalancers', (req, res, ctx) => {
    const nodeBalancers = nodeBalancerFactory.buildList(0);
    return res(ctx.json(makeResourcePage(nodeBalancers)));
  }),
  rest.get('*/nodebalancers/:nodeBalancerID', (req, res, ctx) => {
    const nodeBalancer = nodeBalancerFactory.build({
      id: req.params.nodeBalancerID
    });
    return res(ctx.json(nodeBalancer));
  }),
  rest.get('*/nodebalancers/:nodeBalancerID/configs', (req, res, ctx) => {
    const configs = nodeBalancerConfigFactory.buildList(2, {
      nodebalancer_id: req.params.nodeBalancerID
    });
    return res(ctx.json(makeResourcePage(configs)));
  }),
  rest.get(
    '*/nodebalancers/:nodeBalancerID/configs/:configID/nodes',
    (req, res, ctx) => {
      const configs = nodeBalancerConfigNodeFactory.buildList(2, {
        nodebalancer_id: req.params.nodeBalancerID
      });
      return res(ctx.json(makeResourcePage(configs)));
    }
  ),
  rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
    const buckets = objectStorageBucketFactory.buildList(0);
    return res(ctx.json(makeResourcePage(buckets)));
  }),
  rest.get('*object-storage/clusters', (req, res, ctx) => {
    const clusters = objectStorageClusterFactory.buildList(3);
    return res(ctx.json(makeResourcePage(clusters)));
  }),
  rest.get('*/domains', (req, res, ctx) => {
    const domains = domainFactory.buildList(10);
    return res(ctx.json(makeResourcePage(domains)));
  }),
  rest.post('*/domains/*/records', (req, res, ctx) => {
    const record = domainRecordFactory.build();
    return res(ctx.json(record));
  }),
  rest.get('*/volumes', (req, res, ctx) => {
    const volumes = volumeFactory.buildList(0);
    return res(ctx.json(makeResourcePage(volumes)));
  }),
  rest.get('*/vlans', (req, res, ctx) => {
    const vlans = VLANFactory.buildList(0);
    return res(ctx.json(makeResourcePage(vlans)));
  }),
  rest.get('*/profile/preferences', (req, res, ctx) => {
    return res(ctx.json({ display: 'compact' }));
  }),
  rest.get('*/profile/devices', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage([])));
  }),
  rest.put('*/profile/preferences', (req, res, ctx) => {
    const body = req.body as any;
    return res(ctx.json({ ...body }));
  }),
  rest.get('*/kubeconfig', (req, res, ctx) => {
    return res(ctx.json({ kubeconfig: 'SSBhbSBhIHRlYXBvdA==' }));
  }),
  rest.get('*invoices/:invoiceId/items', (req, res, ctx) => {
    const items = invoiceItemFactory.buildList(10);
    return res(ctx.json(makeResourcePage(items, { page: 1, pages: 4 })));
  }),
  rest.get('*/account', (req, res, ctx) => {
    const account = accountFactory.build({
      balance: 50,
      active_since: '2019-11-05'
    });
    return res(ctx.json(account));
  }),
  rest.put('*/account', (req, res, ctx) => {
    return res(ctx.json({ ...accountFactory.build(), ...(req.body as any) }));
  }),
  rest.get('*/account/transfer', (req, res, ctx) => {
    const transfer = accountTransferFactory.build();
    return res(ctx.delay(5000), ctx.json(transfer));
  }),
  rest.get('*/account/invoices', (req, res, ctx) => {
    const invoices = invoiceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(invoices)));
  }),
  rest.get('*/events', (req, res, ctx) => {
    const events = eventFactory.buildList(1, {
      action: 'lke_node_create',
      percent_complete: 15,
      entity: { type: 'linode', id: 999, label: 'linode-1' },
      message:
        'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.'
    });
    const diskResize = eventFactory.build({
      action: 'disk_resize',
      percent_complete: 75,
      secondary_entity: {
        type: 'disk',
        id: 1,
        label: 'my-disk'
      }
    });
    return res.once(ctx.json(makeResourcePage([...events, diskResize])));
  }),
  rest.get('*/support/tickets', (req, res, ctx) => {
    const tickets = supportTicketFactory.buildList(15, { status: 'open' });
    return res(ctx.json(makeResourcePage(tickets)));
  }),
  rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
    const ticket = supportTicketFactory.build({ id: req.params.ticketId });
    return res(ctx.json(ticket));
  }),
  rest.get('*/support/tickets/:ticketId/replies', (req, res, ctx) => {
    const replies = supportReplyFactory.buildList(15);
    return res(ctx.json(makeResourcePage(replies)));
  }),
  rest.put('*/longview/plan', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/longview/plan', (req, res, ctx) => {
    const plan = longviewActivePlanFactory.build();
    return res(ctx.json(plan));
  }),
  rest.get('*/longview/subscriptions', (req, res, ctx) => {
    const subscriptions = longviewSubscriptionFactory.buildList(10);
    return res(ctx.json(makeResourcePage(subscriptions)));
  }),
  rest.get('*/longview/clients', (req, res, ctx) => {
    const clients = longviewClientFactory.buildList(10);
    return res(ctx.json(makeResourcePage(clients)));
  }),
  rest.post('*/backups/enable/*', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.put('*/account/settings/*', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/tags', (req, res, ctx) => {
    tagFactory.resetSequenceNumber();
    const tags = tagFactory.buildList(5);
    return res(ctx.json(makeResourcePage(tags)));
  }),
  rest.get('*gravatar*', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({}));
  }),
  rest.get('*linode.com/blog/feed*', (req, res, ctx) => {
    return res(ctx.status(400));
  }),
  rest.get('*managed/services', (req, res, ctx) => {
    const monitors = monitorFactory.buildList(5);
    return res(ctx.json(makeResourcePage(monitors)));
  }),
  rest.get('*managed/stats', (req, res, ctx) => {
    const stats = managedStatsFactory.build();
    return res(ctx.json(stats));
  }),
  rest.get('*managed/issues', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage([])));
  }),
  rest.get('*/notifications', (req, res, ctx) => {
    // const emailBounce = notificationFactory.build({
    //   type: 'billing_email_bounce',
    //   entity: null,
    //   when: null,
    //   message: 'We are unable to send emails to your billing email address!',
    //   label: 'We are unable to send emails to your billing email address!',
    //   severity: 'major',
    //   until: null,
    //   body: null
    // });
    // const abuseTicket = abuseTicketNotificationFactory.build();

    const migrationTicket = notificationFactory.build({
      type: 'migration_pending',
      entity: { id: 0, type: 'linode' }
    });

    return res(
      ctx.json(
        makeResourcePage([
          ...notificationFactory.buildList(1),
          // abuseTicket
          // emailBounce
          migrationTicket
        ])
      )
    );
  }),
  rest.post('*/networking/vlans', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post('*/account/payments', (req, res, ctx) => {
    return res(ctx.json(creditPaymentResponseFactory.build()));
  }),
  rest.get('*/databases/mysql/instances', (req, res, ctx) => {
    const online = databaseFactory.build({ status: 'ready' });
    const initializing = databaseFactory.build({ status: 'initializing' });
    const error = databaseFactory.build({ status: 'error' });
    const unknown = databaseFactory.build({ status: 'unknown' });
    const databases = [online, initializing, error, unknown];
    return res(ctx.json(makeResourcePage(databases)));
  })
];

// Generator functions for dynamic handlers, in use by mock data dev tools.
export const mockDataHandlers: Record<
  keyof MockData,
  (count: number) => RequestHandler
> = {
  linode: count =>
    rest.get('*/linode/instances', async (req, res, ctx) => {
      const linodes = linodeFactory.buildList(count);
      return res(ctx.json(makeResourcePage(linodes)));
    }),
  nodeBalancer: count =>
    rest.get('*/nodebalancers', (req, res, ctx) => {
      const nodeBalancers = nodeBalancerFactory.buildList(count);
      return res(ctx.json(makeResourcePage(nodeBalancers)));
    }),
  domain: count =>
    rest.get('*/domains', (req, res, ctx) => {
      const domains = domainFactory.buildList(count);
      return res(ctx.json(makeResourcePage(domains)));
    }),
  volume: count =>
    rest.get('*/volumes', (req, res, ctx) => {
      const volumes = volumeFactory.buildList(count);
      return res(ctx.json(makeResourcePage(volumes)));
    })
};
