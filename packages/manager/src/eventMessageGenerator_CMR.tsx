import { Event } from '@linode/api-v4/lib/account';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes';
import { dcDisplayNames } from 'src/constants';

export const eventMessageGenerator = (
  e: Event,
  linodes: Linode[] = [],
  types: LinodeType[] = []
) => {
  const eventLinode = linodes.find(
    thisLinode => thisLinode.id === e.entity?.id
  );
  switch (e.action) {
    case 'linode_resize':
      const eventLinodeType = types.find(
        thisType => thisType.id === eventLinode?.type
      );
      return `resize ${
        eventLinodeType ? `to ${eventLinodeType.label} Plan` : ''
      }`;
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
      return `migrate ${
        eventLinode ? `to ${dcDisplayNames[eventLinode.region]}` : ''
      }`;
    case 'disk_imagize':
      return `is being created`;
    case 'linode_boot':
      return `boot with ${e.secondary_entity?.label}`;
    case 'linode_reboot':
      return `reboot with ${e.secondary_entity?.label}`;
    case 'linode_shutdown':
      return 'is shutting down';

    default:
      return null;
  }
};

export const eventLabelGenerator = (e: Event) => {
  if (['disk_imagize'].includes(e.action)) {
    return e.secondary_entity?.label;
  }
  return e.entity?.label;
};
