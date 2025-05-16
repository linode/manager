import { firewallEntityfactory, firewallFactory } from 'src/factories';

import { canEntityBeAssignedToFirewall } from './utils';

import type { FirewallStatus } from '@linode/api-v4';

const firewallEntitiesEnabled = firewallEntityfactory
  .buildList(5)
  .map((entity) => {
    return { ...entity, firewallStatus: 'enabled' as FirewallStatus };
  });
const firewallEntitiesDisabled = firewallEntityfactory
  .buildList(5)
  .map((entity) => {
    return { ...entity, firewallStatus: 'disabled' as FirewallStatus };
  });

describe('canBeAssignedToFirewall', () => {
  it('can be assigned to the given disabled firewall', () => {
    // entity to assign is not already assigned to the given firewall
    const firewall = firewallFactory.build({
      status: 'disabled',
    });

    expect(
      canEntityBeAssignedToFirewall({
        firewall,
        entityId: firewall.entities[0].id + 1,
        entityType: 'interface',
        firewallEntities: firewallEntitiesEnabled,
      })
    ).toBe(true);
  });

  it('cannot be assigned to the given disabled firewall', () => {
    // entity to assign is already assigned to the given firewall,
    const firewallEntity = firewallEntityfactory.build({
      id: 2,
    });
    const firewall = firewallFactory.build({
      status: 'disabled',
      entities: [firewallEntity],
    });

    expect(
      canEntityBeAssignedToFirewall({
        firewall,
        entityId: firewall.entities[0].id,
        entityType: 'linode',
        firewallEntities: [
          {
            ...firewallEntity,
            firewallStatus: 'disabled',
          },
        ],
      })
    ).toBe(false);
  });

  it('can be assigned to the given enabled firewall', () => {
    // all devices in given firewallEntities are disabled
    const firewall = firewallFactory.build();
    expect(
      canEntityBeAssignedToFirewall({
        firewall,
        entityId: firewall.entities[0].id + 1,
        entityType: 'interface',
        firewallEntities: firewallEntitiesDisabled,
      })
    ).toBe(true);
  });

  it('cannot be assigned to the given enabled firewall', () => {
    // at least one device in given firewallEntities is enabled
    const firewall = firewallFactory.build();
    expect(
      canEntityBeAssignedToFirewall({
        firewall,
        entityId: firewall.entities[0].id + 1,
        entityType: 'interface',
        firewallEntities: firewallEntitiesEnabled,
      })
    ).toBe(true);
  });
});
