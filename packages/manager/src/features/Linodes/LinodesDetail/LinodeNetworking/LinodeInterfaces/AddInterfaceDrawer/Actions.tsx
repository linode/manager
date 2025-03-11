import React from 'react';
import { useFormContext } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import type { CreateLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
}

export const Actions = ({ onClose }: Props) => {
  const {
    formState: { isSubmitting },
  } = useFormContext<CreateLinodeInterfacePayload>();

  return (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Add Network Interface',
        loading: isSubmitting,
        type: 'submit',
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );
};
