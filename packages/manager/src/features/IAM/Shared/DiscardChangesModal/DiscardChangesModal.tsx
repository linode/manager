import { Button, Modal } from '@akamai/cds-components/react';
import * as React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';

interface Props {
  onClose: () => void;
  onDiscard: () => void;
  open: boolean;
  /** Pendo IDs for tracking modal appearance and button clicks. */
  pendoIds?: {
    discard?: string;
    goBack?: string;
    view?: string;
  };
}

export const DiscardChangesModal = (props: Props) => {
  const { onClose, onDiscard, open, pendoIds } = props;

  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <Modal
      data-pendo-id={pendoIds?.view}
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
        <Button
          data-pendo-id={pendoIds?.discard}
          onClick={onDiscard}
          variant="danger"
        >
          Discard Changes
        </Button>
        <Button
          data-pendo-id={pendoIds?.goBack}
          onClick={onClose}
          variant="primary"
        >
          Go Back And Review Changes
        </Button>
      </div>
    </Modal>
  );
};
