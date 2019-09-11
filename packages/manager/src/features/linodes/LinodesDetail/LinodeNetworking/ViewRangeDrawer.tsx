import { IPRange } from 'linode-js-sdk/lib/networking';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { formatRegion } from 'src/utilities';

type ClassNames = 'root' | 'section';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    section: {
      marginBottom: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  });

interface Props {
  open: boolean;
  range?: IPRange;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ViewRangeDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { classes, range } = props;
  const region = (range && range.region) || '';

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={`Details for IP Range`}
    >
      {props.range && (
        <React.Fragment>
          <div className={classes.section}>
            <Typography variant="h3">IP Range</Typography>
            <Typography variant="body1">{props.range.range}</Typography>
          </div>

          <div
            className={classes.section}
            style={{ border: 0, paddingBottom: 0 }}
          >
            <Typography variant="h3">Region</Typography>
            <Typography variant="body1">{formatRegion(region)}</Typography>
          </div>

          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={props.onClose}
              data-qa-cancel
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(ViewRangeDrawer);
