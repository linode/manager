import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import withImage from 'src/containers/withImage.container';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { formatRegion } from 'src/utilities';

type ClassNames =
  | 'root'
  | 'title'
  | 'section'
  | 'region'
  | 'volumeLink'
  | 'regionInner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 12,
    marginTop: theme.spacing.unit * 2
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  section: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.unit,
    ...theme.typography.body1,
    '& .dif': {
      position: 'relative',
      paddingRight: 35,
      width: 'auto',
      '& .chip': {
        position: 'absolute',
        top: '-4px',
        right: 0
      }
    }
  },
  region: {
    [theme.breakpoints.between('sm', 'md')]: {
      flexBasis: '100%',
      maxWidth: '100%',
      display: 'flex'
    }
  },
  regionInner: {
    [theme.breakpoints.only('xs')]: {
      padding: '0 8px !important'
    },
    [theme.breakpoints.up('lg')]: {
      '&:first-of-type': {
        padding: '8px 8px 0 8px !important'
      },
      '&:last-of-type': {
        padding: '0 8px !important'
      }
    }
  },
  volumeLink: {
    color: theme.palette.primary.main,
    fontSize: '1rem',
    '&:hover, &:focus': {
      textDecoration: 'underline'
    }
  }
});

interface Props {
  linode: Linode.Linode;
  linodeImageId: null | string;
  volumes: Linode.Volume[];
  typesLongLabel: string;
}
type CombinedProps = Props & WithImage & WithStyles<ClassNames>;

class SummaryPanel extends React.Component<CombinedProps> {
  renderImage = () => {
    const { image } = this.props;

    return (
      <span>
        {image ? image.label : image === null ? 'No Image' : 'Unknown Image'}
      </span>
    );
  };

  render() {
    const { classes, linode, volumes, typesLongLabel } = this.props;

    return (
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <Typography
              role="header"
              variant="h2"
              className={classes.title}
              data-qa-title
            >
              Summary
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <div className={classes.section}>{this.renderImage()}</div>
            <div className={classes.section}>
              {<span>{typesLongLabel}</span>}
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <div className={classes.section}>
              <IPAddress ips={linode.ipv4} copyRight showMore />
            </div>
            {linode.ipv6 && (
              <div className={classes.section}>
                <IPAddress ips={[linode.ipv6]} copyRight showMore />
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={4} className={classes.region}>
            <Grid container>
              <Grid item xs={12} sm={6} lg={12} className={classes.regionInner}>
                <div className={`${classes.section}`}>
                  {formatRegion(linode.region)}
                </div>
              </Grid>
              <Grid item xs={12} sm={6} lg={12} className={classes.regionInner}>
                <div
                  className={classes.section}
                  data-qa-volumes={volumes.length}
                >
                  Volumes:&#160;
                  <Link
                    className={classes.volumeLink}
                    to={`/linodes/${linode.id}/volumes`}
                  >
                    {volumes.length}
                  </Link>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

interface WithImage {
  image?: Linode.Image;
}

const enhanced = compose<CombinedProps, Props>(
  styled,
  withImage<Props & WithImage, Props>(
    props => props.linodeImageId,
    (ownProps, image) => ({ ...ownProps, image })
  )
);

export default enhanced(SummaryPanel);
