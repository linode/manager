import * as React from 'react';
import { Event } from '@linode/api-v4/lib/account';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes';
import Link from 'src/components/Link';
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
      return `create from ${e.entity?.label}`;
    case 'linode_boot':
      return `boot with ${e.secondary_entity?.label}`;
    case 'host_reboot':
      return 'reboot (Host initiated restart)';
    case 'lassie_reboot':
      return 'reboot (Lassie watchdog service)';
    case 'linode_reboot':
      return `reboot with ${e.secondary_entity?.label}`;
    case 'linode_shutdown':
      return 'shutdown';
    case 'linode_clone':
      return (
        <>
          clone to{` `}
          <Link to={`/linodes/${e.secondary_entity?.id}`}>
            {e.secondary_entity?.label}
          </Link>
        </>
      );
    case 'disk_resize':
      return 'disk resize';
    case 'disk_duplicate':
      return 'disk duplicate';
    case 'backups_restore':
      return 'backup restore';
    case 'linode_snapshot':
      return 'snapshot backup';
    case 'linode_mutate':
      return 'upgrade';
    case 'linode_rebuild':
      return 'rebuild';
    case 'linode_create':
      return 'provisioning';

    default:
      // If we haven't handled it explicitly here, it doesn't count as
      // a "Pending Action" for our purposes.
      return null;
  }
};

export const eventLabelGenerator = (e: Event) => {
  if (['disk_imagize'].includes(e.action)) {
    return e.secondary_entity?.label;
  }
  return e.entity?.label;
};
