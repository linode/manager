import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  range?: Linode.IPRange;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ViewRangeDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={`Details for IP Range`}
    >
      {props.range &&
        <React.Fragment>
          <Typography variant="title">IP Range</Typography>
          <Typography variant="body1">
            {props.range.range}
          </Typography>

          <Typography variant="title">Region</Typography>
          <Typography variant="body1">
            {props.range.region}
          </Typography>

          <ActionsPanel>
            <Button
              variant="raised"
              color="secondary"
              onClick={props.onClose}
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      }
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ViewRangeDrawer);
