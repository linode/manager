import { Drawer as CDSDrawer } from '@akamai/cds-components/react';
import type { ComponentProps } from 'react';
import React, { useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Drawer(props: ComponentProps<typeof CDSDrawer>) {
  const { onClose, open, ...rest } = props;
  const wasOpenRef = useRef(false);

  if (open) {
    wasOpenRef.current = true;
  }

  // Workaround for CDSDrawer bug that calls onClose during initialization
  // Only propagate events if the drawer was previously opened
  const handleClose = useCallback(
    (event: CustomEvent<unknown>) => {
      if (wasOpenRef.current && onClose) {
        onClose(event);
      }
    },
    [onClose]
  );

  return createPortal(
    <CDSDrawer {...rest} onClose={handleClose} open={open} />,
    document.body
  );
}
