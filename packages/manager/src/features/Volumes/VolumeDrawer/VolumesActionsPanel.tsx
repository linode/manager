import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';

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
      primaryButtonDataTestId="submit"
      primaryButtonDisabled={disabled}
      primaryButtonHandler={onSubmit}
      primaryButtonLoading={isSubmitting}
      primaryButtonText={submitText ?? 'Submit'}
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onCancel}
      secondaryButtonText="Cancel"
      showPrimary
      showSecondary
    />
  );
};

export default VolumesActionsPanel;
