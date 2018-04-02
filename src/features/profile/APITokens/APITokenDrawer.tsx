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
  activeToken: Linode.Token | null;
  drawerOpen: boolean;
  closeDrawer: () => void;
}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class APITokenDrawer extends React.Component<CombinedProps, State> {
  state = {};

  render() {
    const { activeToken, drawerOpen, closeDrawer } = this.props;

    return (
      <Drawer
        title={(activeToken && (activeToken as Linode.Token).label) || ''}
        open={drawerOpen}
        onClose={closeDrawer}
      >
        This application has access to your:
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(APITokenDrawer);
