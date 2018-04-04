import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Hidden from 'material-ui/Hidden';

import { typeLabelLong, formatRegion } from 'src/features/linodes/presentation';

type ClassNames = 'root' | 'text';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
  },
  text: {
    marginTop: theme.spacing.unit,
  },
});

interface Props {
  linode: Linode.Linode;
  image: Linode.Image;
  type: Linode.LinodeType;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode, image, type } = props;

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subheading">
            Summary
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.text} variant="body1">
            {image.label} {image.description}
          </Typography>
          <Typography className={classes.text} variant="body1">
            {typeLabelLong(type.memory, type.disk, type.vcpus)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.text} variant="body1">
            {linode.ipv4}
          </Typography>
          <Typography className={classes.text} variant="body1">
            {linode.ipv6}
          </Typography>
        </Grid>
        <Hidden lgUp>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.text} variant="body1">
              {formatRegion(linode.region)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.text} variant="body1">
              Volumes: 2
            </Typography>
          </Grid>
        </Hidden>
        <Hidden mdDown>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.text} variant="body1">
              {formatRegion(linode.region)}
            </Typography>
            <Typography className={classes.text} variant="body1">
              Volumes: 2
            </Typography>
          </Grid>
        </Hidden>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);
