import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

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
    <ActionsPanel>
      {onCancel && (
        <Button buttonType="secondary" onClick={onCancel} data-qa-cancel>
          Cancel
        </Button>
      )}
      {onSubmit && (
        <Button
          buttonType="primary"
          disabled={disabled}
          loading={isSubmitting}
          onClick={onSubmit}
          data-qa-submit
        >
          {submitText ?? 'Submit'}
        </Button>
      )}
    </ActionsPanel>
  );
};

export default VolumesActionsPanel;
