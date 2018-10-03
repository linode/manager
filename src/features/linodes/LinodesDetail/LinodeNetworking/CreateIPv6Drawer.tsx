import * as React from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const CreateIPv6Drawer: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title="Allocate IPv6 Ranges"
    >
      <React.Fragment>
        <Typography variant="body1" data-qa-service-notice>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself. These ranges can only be
          allocated by our support team. Please open a <Link
          to="/support">Support Ticket</Link> and request an IPv6 range for
          this Linode.
        </Typography>
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            variant="raised"
            color="primary"
            className="cancel"
            onClick={props.onClose}
            data-qa-cancel
          >
            Close
          </Button>
        </ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(CreateIPv6Drawer);
