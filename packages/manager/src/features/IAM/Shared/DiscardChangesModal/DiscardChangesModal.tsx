import { Button, Modal } from '@akamai/cds-components/react';
import * as React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';

interface Props {
  onClose: () => void;
  onDiscard: () => void;
  open: boolean;
}

export const DiscardChangesModal = (props: Props) => {
  const { onClose, onDiscard, open } = props;

  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <Modal
      height={'205px'}
      onModalClosed={onClose}
      open={open}
      role="dialog"
      size="small"
      width={isSmUp ? '520px' : '100%'}
    >
      <span slot="title">Discard changes?</span>
      <div slot="body">
        <p>
          The changes you made haven’t been applied. If you navigate away from
          this page, your changes will be discarded.
        </p>
      </div>
      <div
        slot="actions"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}
      >
        <Button onClick={onDiscard} variant="danger">
          Discard Changes
        </Button>
        <Button onClick={onClose} variant="primary">
          Go Back And Review Changes
        </Button>
      </div>
    </Modal>
  );
};
