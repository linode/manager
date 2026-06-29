import { Drawer as CDSDrawer } from '@akamai/cds-components/react';
import type { ComponentProps } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';

export function Drawer(props: ComponentProps<typeof CDSDrawer>) {
  return createPortal(<CDSDrawer {...props} />, document.body);
}
