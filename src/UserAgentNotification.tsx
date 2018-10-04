import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  warning?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserAgentNotification extends React.Component<CombinedProps, {}> {
  actions = () => <Button onClick={this.props.onClose} type="primary">Dismiss</Button>;

  render() {
    const { warning } = this.props;

    return (
      <ConfirmationDialog
        data-qa-browser-warning
        actions={this.actions}
        open={this.props.open}
        onClose={this.props.onClose}
        title="Please update your browser"
      >
        {warning}
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserAgentNotification);
