import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';

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
    <ActionsPanel>
      {onCancel && (
        <Button buttonType="secondary" data-qa-cancel onClick={onCancel}>
          Cancel
        </Button>
      )}
      {onSubmit && (
        <Button
          buttonType="primary"
          data-qa-submit
          disabled={disabled}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {submitText ?? 'Submit'}
        </Button>
      )}
    </ActionsPanel>
  );
};

export default VolumesActionsPanel;
