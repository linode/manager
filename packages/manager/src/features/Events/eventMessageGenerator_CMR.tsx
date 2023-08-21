import { Event } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { formatEventWithAPIMessage } from 'src/features/Events/eventMessageGenerator';

import { ExtendedType } from '../../utilities/extendType';

export const eventMessageGenerator = (
  e: Event,
  linodes: Linode[] = [],
  types: ExtendedType[] = [],
  regions: Region[] = []
) => {
  const eventLinode = linodes.find(
    (thisLinode) => thisLinode.id === e.entity?.id
  );

  if (e.message) {
    return formatEventWithAPIMessage(e);
  }
  switch (e.action) {
    case 'linode_resize':
      const eventLinodeType = types.find(
        (thisType) => thisType.id === eventLinode?.type
      );
      return `resize ${
        eventLinodeType ? `to ${eventLinodeType.formattedLabel} Plan` : ''
      }`;
    case 'linode_migrate':
    case 'linode_migrate_datacenter':
      const region = regions.find((r) => r.id === eventLinode?.region);
      return `migrate ${
        eventLinode ? `to ${region?.label ?? eventLinode.region}` : ''
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
      if (e.secondary_entity !== null) {
        return `reboot with ${e.secondary_entity?.label}`;
      } else {
        return 'is rebooting.';
      }
    case 'linode_shutdown':
      return 'shutdown';
    case 'linode_delete':
      return 'delete';
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
    case 'image_upload':
      return 'image uploading';
    case 'volume_migrate':
      return `Volume ${e.entity?.label} is being upgraded to NVMe.`;

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
