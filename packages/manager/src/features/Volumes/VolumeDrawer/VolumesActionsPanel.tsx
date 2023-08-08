import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

interface Props {
  disabled?: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitText?: string;
}

type CombinedProps = Props;

const VolumesActionsPanel: React.FC<CombinedProps> = ({
  disabled,
  isSubmitting,
  onCancel,
  onSubmit,
  submitText,
}) => {
  return (
    // We could remove this with ActionsPanel component.
    <ActionsPanel
      primaryButtonProps={
        onSubmit
          ? {
              'data-testid': 'submit',
              disabled,
              label: submitText ?? 'Submit',
              loading: isSubmitting,
              onClick: onSubmit,
            }
          : undefined
      }
      secondaryButtonProps={
        onCancel
          ? {
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onCancel,
            }
          : undefined
      }
    />
  );
};

export default VolumesActionsPanel;
