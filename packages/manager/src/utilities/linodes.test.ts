import { Subnet } from '@linode/api-v4';
import {
  accountMaintenanceFactory,
  linodeFactory,
  vpcFactory,
} from 'src/factories';

import { addMaintenanceToLinodes, addVPCToLinodes } from './linodes';

describe('addMaintenanceToLinodes', () => {
  it('adds relevant maintenance items to Linodes', () => {
    const linodes = linodeFactory.buildList(2);
    const accountMaintenance = accountMaintenanceFactory.buildList(1, {
      entity: { type: 'linode' },
    });
    const result = addMaintenanceToLinodes(accountMaintenance, linodes);
    expect(result[0].maintenance).not.toBeNull();
    expect(result[1].maintenance).toBeNull();
    expect(result[0].maintenance?.when).toBe(accountMaintenance[0].when);
  });
});

// TODO: VPC - change tests as necessary if query used in src/features/Linodes/index.tsx changes
describe('addVPCtoLinodes', () => {
  it('adds relevant vpc items to Linodes', () => {
    const linodes = linodeFactory.buildList(2);
    const vpcs = vpcFactory.buildList(1);
    const subnet: Subnet = {
      created: '2023-07-12T16:08:53',
      id: 1,
      ipv4: '0.0.0.0/0',
      label: `subnet-1`,
      linodes: [],
      updated: '2023-07-12T16:08:53',
    };
    subnet.linodes.push(linodes[0].id);
    vpcs[0].subnets.push(subnet);

    const result = addVPCToLinodes(vpcs, linodes);
    expect(result[0].vpcId).not.toBeNull();
    expect(result[0].vpcLabel).not.toBeNull();
    expect(result[0].vpcId).toBe(vpcs[0].id);
    expect(result[0].vpcLabel).toBe(vpcs[0].label);
    expect(result[1].vpcId).toBeUndefined();
    expect(result[1].vpcLabel).toBeUndefined();
  });
});
