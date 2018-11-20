import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  isSubmitting: boolean;
  onSubmit: any;
  onCancel: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const VolumesActionsPanel: React.StatelessComponent<CombinedProps> = ({
  onSubmit, isSubmitting, onCancel
}) => {
  return (
    <ActionsPanel style={{ marginTop: 16 }}>
      <Button onClick={onSubmit} type="primary" loading={isSubmitting} data-qa-submit>
        Submit
    </Button>
      <Button onClick={onCancel} type="cancel" data-qa-cancel >Cancel</Button>
    </ActionsPanel>
  );
};

const styled = withStyles(styles);

export default styled(VolumesActionsPanel);
