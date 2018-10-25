import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { formatRegion } from 'src/utilities';

type ClassNames = 'root'
  | 'title'
  | 'section'
  | 'region'
  | 'volumeLink';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: 20,
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
  volumes: Linode.Volume[];
  typesLongLabel: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode, image, volumes, typesLongLabel } = props;
  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography
            role="header"
            variant="headline"
            className={classes.title}
            data-qa-title
          >
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
            {<span>
              {typesLongLabel}
            </span>}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Typography className={classes.section} variant="caption">
            <IPAddress ips={linode.ipv4} copyRight />
          </Typography>
          {
            linode.ipv6 &&
            <Typography className={classes.section} variant="caption">
              <IPAddress ips={[linode.ipv6]} copyRight />
            </Typography>
          }
        </Grid>
        <Grid item xs={12} sm={6} lg={4} className={classes.region}>
          <Typography className={`${classes.section}`} variant="caption">
            {formatRegion(linode.region)}
          </Typography>
          <Typography
            className={classes.section}
            variant="caption"
            data-qa-volumes={volumes.length}
        >
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

export default compose(styled)(SummaryPanel) as React.ComponentType<Props>;
