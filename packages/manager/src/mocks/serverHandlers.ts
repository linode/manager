import { rest } from 'msw';

import {
  accountFactory,
  domainFactory,
  imageFactory,
  firewallFactory,
  firewallDeviceFactory,
  kubernetesClusterFactory,
  kubeEndpointFactory,
  invoiceItemFactory,
  nodePoolFactory,
  linodeConfigFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  nodeBalancerFactory,
  profileFactory,
  supportTicketFactory,
  volumeFactory,
  accountTransferFactory,
  eventFactory
} from 'src/factories';

import cachedRegions from 'src/cachedData/regions.json';

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
  rest.get('*/regions', async (req, res, ctx) => {
    return res(ctx.json(cachedRegions));
  }),
  rest.get('*/images', async (req, res, ctx) => {
    const privateImages = imageFactory.buildList(10);
    const publicImages = imageFactory.buildList(10, { is_public: true });
    const images = [...privateImages, ...publicImages];
    return res(ctx.json(makeResourcePage(images)));
  }),
  rest.get('*/instances', async (req, res, ctx) => {
    const linodes = linodeFactory.buildList(1);
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
    const clusters = kubernetesClusterFactory.buildList(10);
    return res(ctx.json(makeResourcePage(clusters)));
  }),
  rest.get('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = req.params.clusterId;
    const cluster = kubernetesClusterFactory.build({ id });
    return res(ctx.json(cluster));
  }),
  rest.get('*/lke/clusters/:clusterId/pools', async (req, res, ctx) => {
    const pools = nodePoolFactory.buildList(2);
    return res(ctx.json(makeResourcePage(pools)));
  }),
  rest.get('*/lke/clusters/*/api-endpoints', async (req, res, ctx) => {
    const endpoints = kubeEndpointFactory.buildList(2);
    return res(ctx.json(makeResourcePage(endpoints)));
  }),
  rest.get('*/firewalls/', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
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
  rest.get('*/nodebalancers', (req, res, ctx) => {
    const nodeBalancers = nodeBalancerFactory.buildList(10);
    return res(ctx.json(makeResourcePage(nodeBalancers)));
  }),
  rest.get('*/domains', (req, res, ctx) => {
    const domains = domainFactory.buildList(25);
    return res(ctx.json(makeResourcePage(domains)));
  }),
  rest.get('*/volumes', (req, res, ctx) => {
    const volumes = volumeFactory.buildList(10);
    return res(ctx.json(makeResourcePage(volumes)));
  }),
  rest.get('*/profile/preferences', (req, res, ctx) => {
    return res(ctx.json({ display: 'compact' }));
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
    const account = accountFactory.build({ balance: 50 });
    return res(ctx.json(account));
  }),
  rest.get('*/account/transfer', (req, res, ctx) => {
    const transfer = accountTransferFactory.build();
    return res(ctx.json(transfer));
  }),
  rest.get('*/events', (req, res, ctx) => {
    const events = eventFactory.buildList(10);
    return res(ctx.json(makeResourcePage(events)));
  }),
  rest.get('*/support/tickets', (req, res, ctx) => {
    const tickets = supportTicketFactory.buildList(15, { status: 'open' });
    return res(ctx.json(makeResourcePage(tickets)));
  })
];
