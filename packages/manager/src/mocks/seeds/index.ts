import { linodesSeeder } from './linodes/linodes-seeder';
import { placementGroupSeeder } from './placementGroups/placementGroup-seeder';
import { volumesSeeder } from './volumes/volumes-seeder';

export const allStateSeeders = [
  linodesSeeder,
  placementGroupSeeder,
  volumesSeeder,
];
