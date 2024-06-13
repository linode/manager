import { manyLinodesPopulator } from './linodes/many-linodes-populator';

import { productionRegionsPopulator } from './environment/production-regions';
import { edgeRegionsPopulator } from './environment/edge-regions';
import { legacyRegionsPopulator } from './environment/legacy-test-regions';

export const allContextPopulators = [
  manyLinodesPopulator,

  productionRegionsPopulator,
  edgeRegionsPopulator,
  legacyRegionsPopulator,
];
