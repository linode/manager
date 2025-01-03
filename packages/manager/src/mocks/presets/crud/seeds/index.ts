import { domainSeeder } from './domains';
import { linodesSeeder } from './linodes';
import { placementGroupSeeder } from './placementGroups';
import { supportTicketsSeeder } from './supportTickets';
import { volumesSeeder } from './volumes';

export const dbSeeders = [
  domainSeeder,
  linodesSeeder,
  placementGroupSeeder,
  supportTicketsSeeder,
  volumesSeeder,
];
