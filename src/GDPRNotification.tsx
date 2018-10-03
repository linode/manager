import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class GDPRNotification extends React.PureComponent<CombinedProps, {}> {
  actions = () => <Button onClick={this.props.onClose} type="primary">Dismiss</Button>;

  render() {
    return (
      <ConfirmationDialog
        actions={this.actions}
        open={this.props.open}
        onClose={this.props.onClose}
        title="Privacy Policy Update"
      >
        <Typography style={{ marginBottom: 8 }}><strong>We've updated our policies.</strong></Typography>
        <Typography>You must agree to the terms at <a href='https://manager.linode.com/account/policy'>https://manager.linode.com/account/policy</a> to permanently dismiss this window.</Typography>
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(GDPRNotification);
