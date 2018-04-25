import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';

import Drawer from 'src/components/Drawer';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  ip?: Linode.IPAddress;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ViewIPDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={`Details for IP`}
    >
      {props.ip &&
        <React.Fragment>
          <Typography variant="title">Address</Typography>
          <Typography variant="body1">
            {props.ip.address}
          </Typography>

          <Typography variant="title">Gateway</Typography>
          <Typography variant="body1">
            {props.ip.gateway}
          </Typography>

          <Typography variant="title">Subnet Mask</Typography>
          <Typography variant="body1">
            {props.ip.subnet_mask}
          </Typography>

          <Typography variant="title"></Typography>
          <Typography variant="body1">
            /{props.ip.prefix}
          </Typography>
        </React.Fragment>
      }
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ViewIPDrawer);
