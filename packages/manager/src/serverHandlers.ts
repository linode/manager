import { rest } from 'msw';

import {
  domainFactory,
  imageFactory,
  firewallFactory,
  firewallDeviceFactory,
  kubernetesClusterFactory,
  linodeConfigFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  nodeBalancerFactory,
  // profileFactory
  volumeFactory
} from 'src/factories';

import cachedRegions from 'src/cachedData/regions.json';

export const makeResourcePage = (e: any[]) => ({
  page: 1,
  pages: 1,
  results: e.length,
  data: e
});

export const handlers = [
  // rest.get('*/profile', async (req, res, ctx) => {
  //   const profile = profileFactory.build();
  //   return res(ctx.json(profile));
  // }),
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
    const linodes = linodeFactory.buildList(10);
    return res(ctx.json(makeResourcePage(linodes)));
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
  rest.get('*/firewalls/', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
    return res(ctx.json(makeResourcePage(firewalls)));
  }),
  rest.get('*/firewalls/*/devices', (req, res, ctx) => {
    const devices = firewallDeviceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(devices)));
  }),
  rest.get('*/nodebalancers', (req, res, ctx) => {
    const nodeBalancers = nodeBalancerFactory.buildList(10);
    return res(ctx.json(makeResourcePage(nodeBalancers)));
  }),
  rest.get('*/domains', (req, res, ctx) => {
    const domains = domainFactory.buildList(10);
    return res(ctx.json(makeResourcePage(domains)));
  }),
  rest.get('*/volumes', (req, res, ctx) => {
    const volumes = volumeFactory.buildList(10);
    return res(ctx.json(makeResourcePage(volumes)));
  }),
  rest.get('*/profile/preferences', (req, res, ctx) => {
    return res(ctx.json({}));
  })
];
