import { domainSeeder } from './domains';
import { firewallSeeder } from './firewalls';
import { linodesSeeder } from './linodes';
import { ipAddressSeeder } from './networking';
import { placementGroupSeeder } from './placementGroups';
import { supportTicketsSeeder } from './supportTickets';
import { volumesSeeder } from './volumes';
import { vpcSeeder } from './vpcs';

export const dbSeeders = [
  domainSeeder,
  firewallSeeder,
  ipAddressSeeder,
  linodesSeeder,
  placementGroupSeeder,
  supportTicketsSeeder,
  volumesSeeder,
  vpcSeeder,
];
