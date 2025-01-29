import { domainSeeder } from './domains';
import { firewallSeeder } from './firewalls';
import { linodesSeeder } from './linodes';
import { placementGroupSeeder } from './placementGroups';
import { supportTicketsSeeder } from './supportTickets';
import { volumesSeeder } from './volumes';

export const dbSeeders = [
  domainSeeder,
  firewallSeeder,
  linodesSeeder,
  placementGroupSeeder,
  supportTicketsSeeder,
  volumesSeeder,
];
