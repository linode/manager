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
}

interface State {

}

type CombinedProps = Props & WithStyles<ClassNames>;

class GDPRNotification extends React.Component<CombinedProps, State> {
  state: State = {
  };
  
  actions = () => <Button onClick={this.props.onClose} type="primary">Dismiss</Button>;

  render() {
    return (
      <ConfirmationDialog
        actions={this.actions}
        open={this.props.open}
        onClose={this.props.onClose}
        title="Privacy Policy Update"
      >
        We've updated our policies. See <a href='https://manager.linode.com/account/policy'>https://manager.linode.com/account/policy</a> for more information.
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(GDPRNotification);
