import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'warningCopy';

const styles = (theme: Theme) =>
  createStyles({
    warningCopy: {
      color: theme.color.red,
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  open: boolean;
  error?: string;
  loading: boolean;
  onClose: () => void;
  onSnapshot: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DestructiveSnapshotDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button buttonType="cancel" onClick={this.props.onClose} data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={this.props.onSnapshot}
          data-qa-confirm
          loading={this.props.loading}
        >
          {'Take Snapshot'}
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const title = 'Take a snapshot?';

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`${title}`}
        onClose={this.props.onClose}
        actions={this.renderActions}
        error={this.props.error}
      >
        <Typography>
          Taking a snapshot will back up your Linode in its current state,
          over-writing your previous snapshot. Are you sure?
        </Typography>
      </ConfirmationDialog>
    );
  }
}

export default withStyles(styles)(DestructiveSnapshotDialog);
