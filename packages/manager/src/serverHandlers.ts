import { rest } from 'msw';

import {
  firewallFactory,
  firewallDeviceFactory
} from 'src/factories/firewalls';

export const makeResourcePage = (e: any[]) => ({
  page: 1,
  pages: 1,
  results: e.length,
  data: e
});

export const handlers = [
  // rest.get('/images', async (req, res, ctx) => {
  //   const images = imageFactory.buildList(10);
  //   return res(ctx.json(makeResourcePage(images)));
  // }),
  // rest.get('/lke/clusters', async (req, res, ctx) => {
  //   const clusters = kubernetesClusterFactory.buildList(10);
  //   return res(ctx.json(makeResourcePage(clusters)));
  // }),
  rest.get('*/firewalls/', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
    return res(ctx.json(makeResourcePage(firewalls)));
  }),
  rest.get('*/firewalls/*/devices', (req, res, ctx) => {
    const devices = firewallDeviceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(devices)));
  })
];
