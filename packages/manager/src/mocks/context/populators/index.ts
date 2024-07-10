import { edgeRegionsPopulator } from './environment/edge-regions';
import { legacyRegionsPopulator } from './environment/legacy-test-regions';
import { productionRegionsPopulator } from './environment/production-regions';
import { manyLinodesPopulator } from './linodes/many-linodes-populator';

export const allContextPopulators = [
  manyLinodesPopulator,
  productionRegionsPopulator,
  edgeRegionsPopulator,
  legacyRegionsPopulator,
];
