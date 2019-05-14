import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';

import { oneClickApps } from './FakeSpec';

type ClassNames = 'root' | 'logo';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  logo: {
    marginTop: theme.spacing.unit * 3
  }
});

interface Props {
  stackscriptID: number;
  open: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AppDetailDrawer: React.FunctionComponent<
  CombinedProps
> = props => {
  const { stackscriptID, open } = props;
  const app = oneClickApps.find(eachApp => eachApp.id === stackscriptID);
  if (!app) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={() => null}
      title={
        '' /* Empty so that we can display the logo beneath the close button rather than a text title */
      }
    >
      <Typography>{app.description}</Typography>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(AppDetailDrawer);
