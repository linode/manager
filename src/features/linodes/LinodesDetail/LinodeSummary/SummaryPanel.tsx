import * as React from 'react';
import { Link } from 'react-router-dom';

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
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';

type ClassNames = 'root' | 'text';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
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
  volumes: Linode.Volume[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode, image, type, volumes } = props;

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
            <IPAddress ips={linode.ipv4} copyRight />
          </Typography>
          <Typography className={classes.text} variant="body1">
            <IPAddress ips={[linode.ipv6]} copyRight />
          </Typography>
        </Grid>

        {/**
          * Note: The following pair of Grid items must be kept in sync. The purpose of doing
          * this is so that at lower breakpoints, these two items, which are not related, dont
          * stack on top of each other, breaking the appearance of the grid, and, at larger
          * breakpoints, they don't break the grid in the other direction.
          **/}
        {/* This is shown at "large" and above */}
        <Hidden mdDown>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.text} variant="body1">
              {formatRegion(linode.region)}
            </Typography>
            <Typography className={classes.text} variant="body1">
              Volumes: <Link
                className="btnLink"
                to={`/linodes/${linode.id}/volumes`}>{volumes.length}</Link>
            </Typography>
          </Grid>
        </Hidden>

        {/* This is shown at medium and below */}
        <Hidden lgUp>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.text} variant="body1">
              {formatRegion(linode.region)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.text} variant="body1">
              Volumes: <Link
                className="btnLink"
                to={`/linodes/${linode.id}/volumes`}>{volumes.length}</Link>
            </Typography>
          </Grid>
        </Hidden>

      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);
