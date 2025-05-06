import { Hidden } from '@linode/ui';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { LinodeInterfaceActionMenu } from './LinodeInterfaceActionMenu';
import { LinodeInterfaceFirewall } from './LinodeInterfaceFirewall';
import { LinodeInterfaceIPs } from './LinodeInterfaceIPs';
import { getLinodeInterfaceType } from './utilities';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';
import type { LinodeInterface } from '@linode/api-v4';

interface Props extends LinodeInterface {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfaceTableRow = (props: Props) => {
  const { created, handlers, id, linodeId, mac_address, updated, version } =
    props;

  const type = getLinodeInterfaceType(props);

  return (
    <TableRow>
      <TableCell>{type}</TableCell>
      <TableCell>{id}</TableCell>
      <Hidden smDown>
        <TableCell>
          <MaskableText isToggleable text={mac_address} />
        </TableCell>
      </Hidden>
      <TableCell>
        <LinodeInterfaceIPs linodeInterface={props} />
      </TableCell>
      <Hidden lgDown>
        <TableCell>{version}</TableCell>
      </Hidden>
      <TableCell>
        <LinodeInterfaceFirewall interfaceId={id} linodeId={linodeId} />
      </TableCell>
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay value={updated} />
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <LinodeInterfaceActionMenu handlers={handlers} id={id} type={type} />
      </TableCell>
    </TableRow>
  );
};
