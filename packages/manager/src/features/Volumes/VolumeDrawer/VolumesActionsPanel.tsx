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
    <ActionsPanel style={{ marginTop: 16 }}>
      {onSubmit && (
        <Button
          onClick={onSubmit}
          buttonType="primary"
          loading={isSubmitting}
          disabled={disabled}
          data-qa-submit
        >
          {submitText ?? 'Submit'}
        </Button>
      )}
      {onCancel && (
        <Button onClick={onCancel} buttonType="cancel" data-qa-cancel>
          Cancel
        </Button>
      )}
    </ActionsPanel>
  );
};

export default VolumesActionsPanel;
