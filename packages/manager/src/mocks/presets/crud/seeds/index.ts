import { cloudNATSeeder } from './cloudnats';
import { delegationSeeder } from './delegation';
import { domainSeeder } from './domains';
import { entitiesSeeder } from './entities';
import { firewallSeeder } from './firewalls';
import { kubernetesSeeder } from './kubernetes';
import { linodesSeeder } from './linodes';
import { ipAddressSeeder } from './networking';
import { nodeBalancerSeeder } from './nodebalancers';
import { placementGroupSeeder } from './placementGroups';
import { supportTicketsSeeder } from './supportTickets';
import { volumesSeeder } from './volumes';
import { vpcSeeder } from './vpcs';

export const dbSeeders = [
  cloudNATSeeder,
  delegationSeeder,
  domainSeeder,
  entitiesSeeder,
  firewallSeeder,
  ipAddressSeeder,
  kubernetesSeeder,
  linodesSeeder,
  nodeBalancerSeeder,
  placementGroupSeeder,
  supportTicketsSeeder,
  volumesSeeder,
  vpcSeeder,
];
