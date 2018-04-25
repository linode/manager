import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
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
      {props.ip && props.ip.address}
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ViewIPDrawer);
