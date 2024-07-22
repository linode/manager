import { linodesPopulator } from './linodes/linodes-populator';
import { placementGroupPopulator } from './placementGroups/placementGroup-populator';
import { edgeRegionsPopulator } from './regions/edge-regions';
import { legacyRegionsPopulator } from './regions/legacy-test-regions';
import { productionRegionsPopulator } from './regions/production-regions';
import { volumesPopulator } from './volumes/volumes-populator';

export const allContextPopulators = [
  linodesPopulator,
  productionRegionsPopulator,
  edgeRegionsPopulator,
  legacyRegionsPopulator,
  placementGroupPopulator,
  volumesPopulator,
];
