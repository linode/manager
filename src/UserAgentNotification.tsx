import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  warning?: string;
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class UserAgentNotification extends React.Component<CombinedProps, State> {
  state: State = {
  };
  
  actions = () => <Button onClick={this.props.onClose} type="primary">Dismiss</Button>;

  render() {
    const { warning } = this.props;

    return (
      <ConfirmationDialog
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
