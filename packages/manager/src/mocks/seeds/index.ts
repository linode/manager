import { linodesSeeder } from './linodes/linodes-seeder';
import { placementGroupSeeder } from './placementGroups/placementGroup-seeder';
import { edgeRegionsSeeder } from './regions/edge-regions-seeder';
import { legacyRegionsSeeder } from './regions/legacy-test-seeder';
import { productionRegionsSeeder } from './regions/production-seeder';
import { volumesSeeder } from './volumes/volumes-seeder';

export const allContextSeeders = [
  linodesSeeder,
  productionRegionsSeeder,
  edgeRegionsSeeder,
  legacyRegionsSeeder,
  placementGroupSeeder,
  volumesSeeder,
];
