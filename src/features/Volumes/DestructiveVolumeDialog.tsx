import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Typography from 'material-ui/Typography';

import Button from 'src/components/Button';
import ActionsPanel from 'src/components/ActionsPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  mode: 'detach' | 'delete';
  onClose: () => void;
  onDetach: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DestructiveVolumeDialog: React.StatelessComponent<CombinedProps> = (props) => {
  const method = {
    detach: props.onDetach,
    delete: props.onDelete,
  }[props.mode];

  const title = {
    detach: 'Detach Volume',
    delete: 'Delete Volume',
  }[props.mode];

  return (
    <ConfirmationDialog
      open={props.open}
      title={`${title}`}
      onClose={props.onClose}
      actions={() =>
        <ActionsPanel style={{ padding: 0 }}>
          <Button
            type="secondary"
            destructive
            onClick={method}
            data-qa-confirm
          >
            Confirm
          </Button>
          <Button
            onClick={props.onClose}
            type="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>Are you sure you want to {props.mode} this volume?</Typography>
    </ConfirmationDialog>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DestructiveVolumeDialog);
