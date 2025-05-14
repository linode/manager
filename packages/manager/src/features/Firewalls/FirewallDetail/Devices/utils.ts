import type {
  Firewall,
  FirewallDeviceEntity,
  FirewallDeviceEntityType,
  FirewallStatus,
} from '@linode/api-v4';

interface FirewallEntityWithStatus extends FirewallDeviceEntity {
  firewallStatus: FirewallStatus;
}

// We can assign multiple firewalls to an entity as long as:
// - the given (disabled) firewall doesn't have the entity
// - the given (enabled) firewall doesn't have this entity and the entity is not assigned to another already enabled firewall
export const canEntityBeAssignedToFirewall = (inputs: {
  entityId: number;
  entityType: FirewallDeviceEntityType;
  firewall: Firewall | undefined;
  firewallEntities: FirewallEntityWithStatus[] | undefined;
}) => {
  const { firewall, entityId, entityType, firewallEntities } = inputs;
  const isEntityAssignedToFirewall = firewall?.entities.some(
    (entity) => entity.type === entityType && entity.id === entityId
  );

  return firewall?.status !== 'enabled'
    ? !isEntityAssignedToFirewall
    : !isEntityAssignedToFirewall &&
        !firewallEntities?.some(
          (service) =>
            service.id === entityId && service.firewallStatus === 'enabled'
        );
};
