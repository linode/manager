import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Button from 'material-ui/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  mode: string;
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
      actions={() => <div>
        <Button
          variant="raised"
          color="secondary"
          className="destructive"
          onClick={method}
          data-qa-confirm
        >
          Confirm
        </Button>
        <Button
          onClick={props.onClose}
          variant="raised"
          color="secondary"
          className="cancel"
          data-qa-cancel
        >
          Cancel
        </Button>
      </div>}
    >
      Are you sure you want to {props.mode} this volume?
    </ConfirmationDialog>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DestructiveVolumeDialog);
