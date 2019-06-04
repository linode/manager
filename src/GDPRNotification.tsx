import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class GDPRNotification extends React.PureComponent<CombinedProps, {}> {
  actions = () => (
    <Button onClick={this.props.onClose} buttonType="primary">
      Dismiss
    </Button>
  );

  render() {
    return (
      <ConfirmationDialog
        actions={this.actions}
        open={this.props.open}
        onClose={this.props.onClose}
        title="Privacy Policy Update"
      >
        <Typography style={{ marginBottom: 8 }}>
          <strong>We've updated our policies.</strong>
        </Typography>
        <Typography>
          You must agree to the terms at{' '}
          <a href="https://manager.linode.com/account/policy">
            https://manager.linode.com/account/policy
          </a>{' '}
          to permanently dismiss this window.
        </Typography>
      </ConfirmationDialog>
    );
  }
}

const styled = withStyles(styles);

export default styled(GDPRNotification);
