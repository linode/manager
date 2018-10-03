import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

class DestructiveVolumeDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    const method = {
      detach: this.props.onDetach,
      delete: this.props.onDelete,
    }[this.props.mode];

    const action = {
      detach: 'Detach',
      delete: 'Delete',
    }[this.props.mode];

    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.props.onClose}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          onClick={method}
          data-qa-confirm
        >
          {action}
        </Button>
    </ActionsPanel>
    );
  }

  render() {

    const title = {
      detach: 'Detach Volume',
      delete: 'Delete Volume',
    }[this.props.mode];

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`${title}`}
        onClose={this.props.onClose}
        actions={this.renderActions}
      >
        <Typography>Are you sure you want to {this.props.mode} this volume?</Typography>
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DestructiveVolumeDialog);
