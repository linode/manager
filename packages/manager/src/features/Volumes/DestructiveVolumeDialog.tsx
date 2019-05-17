import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  mode: 'detach' | 'delete';
  onClose: () => void;
  onDetach: () => void;
  onDelete: () => void;
  volumeLabel: string;
  linodeLabel: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DestructiveVolumeDialog extends React.PureComponent<CombinedProps, {}> {
  renderActions = () => {
    const method = {
      detach: this.props.onDetach,
      delete: this.props.onDelete
    }[this.props.mode];

    const action = {
      detach: 'Detach',
      delete: 'Delete'
    }[this.props.mode];

    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button type="cancel" onClick={this.props.onClose} data-qa-cancel>
          Cancel
        </Button>
        <Button type="secondary" destructive onClick={method} data-qa-confirm>
          {action}
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { volumeLabel: label, linodeLabel } = this.props;
    const title = {
      detach: `Detach ${label ? label : 'Volume'}?`,
      delete: `Delete ${label ? label : 'Volume'}?`
    }[this.props.mode];

    return (
      <ConfirmationDialog
        open={this.props.open}
        title={`${title}`}
        onClose={this.props.onClose}
        actions={this.renderActions}
      >
        <Typography>
          Are you sure you want to {this.props.mode} this volume
          {`${linodeLabel ? ` from ${linodeLabel}?` : '?'}`}
        </Typography>
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles);

export default styled(DestructiveVolumeDialog);
