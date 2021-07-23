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
          buttonType="primary"
          onClick={onSubmit}
          disabled={disabled}
          loading={isSubmitting}
          data-qa-submit
        >
          {submitText ?? 'Submit'}
        </Button>
      )}
      {onCancel && (
        <Button buttonType="secondary" onClick={onCancel} data-qa-cancel>
          Cancel
        </Button>
      )}
    </ActionsPanel>
  );
};

export default VolumesActionsPanel;
