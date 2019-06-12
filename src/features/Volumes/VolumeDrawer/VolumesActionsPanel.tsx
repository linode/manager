import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

interface Props {
  isSubmitting: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

type CombinedProps = Props;

const VolumesActionsPanel: React.StatelessComponent<CombinedProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
  disabled
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
          Submit
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
