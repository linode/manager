import { manyLinodesPopulator } from './linodes/many-linodes-populator';
import { edgeRegionsPopulator } from './regions/edge-regions';
import { legacyRegionsPopulator } from './regions/legacy-test-regions';
import { productionRegionsPopulator } from './regions/production-regions';

export const allContextPopulators = [
  manyLinodesPopulator,
  productionRegionsPopulator,
  edgeRegionsPopulator,
  legacyRegionsPopulator,
];
