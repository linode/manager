import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  actionPanel: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
}));

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
  const classes = useStyles();

  return (
    <ActionsPanel className={classes.actionPanel}>
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
