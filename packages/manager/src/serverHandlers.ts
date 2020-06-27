import { rest } from 'msw';

import {
  domainFactory,
  imageFactory,
  firewallFactory,
  firewallDeviceFactory,
  kubernetesClusterFactory,
  linodeFactory,
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
