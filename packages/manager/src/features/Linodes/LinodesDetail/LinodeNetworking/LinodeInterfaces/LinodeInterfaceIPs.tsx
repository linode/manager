import { Stack } from '@linode/ui';
import React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { ShowMore } from 'src/components/ShowMore/ShowMore';

import { getLinodeInterfaceIPs } from './LinodeInterfaceIPs.utils';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  linodeInterface: LinodeInterface;
}

export const LinodeInterfaceIPs = ({ linodeInterface }: Props) => {
  const [primary, ...ips] = getLinodeInterfaceIPs(linodeInterface);

  return (
    <Stack direction="row" spacing={1.5}>
      <MaskableText isToggleable text={primary} />
      {ips.length > 0 && (
        <ShowMore
          ariaItemType="IP Address"
          items={ips}
          render={(ips) => (
            <Stack>
              {ips.map((ip) => (
                <MaskableText isToggleable key={ip} text={ip} />
              ))}
            </Stack>
          )}
        />
      )}
    </Stack>
  );
};
