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

import { typeLabelLong, formatRegion } from 'src/features/linodes/presentation';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';

type ClassNames = 'root'
| 'title'
| 'section'
| 'region'
| 'volumeLink';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  section: {
    marginBottom: theme.spacing.unit,
  },
  region: {
    [theme.breakpoints.between('sm', 'md')]: {
      flexBasis: '100%',
      maxWidth: '100%',
      display: 'flex',
      '& > span': {
        width: '50%',
      },
    },
  },
  volumeLink: {
    color: theme.palette.primary.main,
    fontSize: '1rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
});

interface Props {
  linode: Linode.Linode;
  image?: Linode.Image;
  type?: Linode.LinodeType;
  volumes: Linode.Volume[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode, image, type, volumes } = props;
  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="title" className={classes.title}>
            Summary
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.section} variant="caption">
            {image
              ? <span>{image.label} {image.description}</span>
              : linode.image
                ? <span>{linode.image}</span>
                : <span>Unknown Image</span>
            }
          </Typography>
          <Typography className={classes.section} variant="caption">
            {type
              ? <span>{typeLabelLong(type.memory, type.disk, type.vcpus)}</span>
              : <span>Unknown Plan</span>
            }
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.section} variant="caption">
            <IPAddress ips={linode.ipv4} copyRight />
          </Typography>
          <Typography className={classes.section} variant="caption">
            <IPAddress ips={[linode.ipv6]} copyRight />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4} className={classes.region}>
          <Typography className={`${classes.section}`} variant="caption">
            {formatRegion(linode.region)}
          </Typography>
          <Typography className={classes.section} variant="caption">
            Volumes: <Link
              className={classes.volumeLink}
              to={`/linodes/${linode.id}/volumes`}>{volumes.length}</Link>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);
