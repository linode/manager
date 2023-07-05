import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';

interface Props {
  isSubmitting: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  submitText?: string;
}

type CombinedProps = Props;

const VolumesActionsPanel: React.FC<CombinedProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
  disabled,
  submitText,
}) => {
  return (
    //We could remove this with ActionsPanel component.
    <ActionsPanel
      primary
      primaryButtonDataTestId="submit"
      primaryButtonDisabled={disabled}
      primaryButtonHandler={onSubmit}
      primaryButtonLoading={isSubmitting}
      primaryButtonText={submitText ?? 'Submit'}
      secondary
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onCancel}
      secondaryButtonText="Cancel"
    />
  );
};

export default VolumesActionsPanel;
