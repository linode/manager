import {
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface Props {
  isSubmitting: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
          type="primary"
          loading={isSubmitting}
          disabled={disabled}
          data-qa-submit
        >
          Submit
        </Button>
      )}
      {onCancel && (
        <Button onClick={onCancel} type="cancel" data-qa-cancel>
          Cancel
        </Button>
      )}
    </ActionsPanel>
  );
};

const styled = withStyles(styles);

export default styled(VolumesActionsPanel);
