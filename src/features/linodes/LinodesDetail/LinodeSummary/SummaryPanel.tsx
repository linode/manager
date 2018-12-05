import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { getImages } from 'src/services/images';
import { formatRegion } from 'src/utilities';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';

type ClassNames = 'root'
  | 'title'
  | 'section'
  | 'region'
  | 'volumeLink'
  | 'regionInner';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 12,
    marginTop: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
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
        right: 0,
      },
    },
  },
  region: {
    [theme.breakpoints.between('sm', 'md')]: {
      flexBasis: '100%',
      maxWidth: '100%',
      display: 'flex',
    },
  },
  regionInner: {
    [theme.breakpoints.only('xs')]: {
      padding: '0 8px !important',
    },
    [theme.breakpoints.up('lg')]: {
      '&:first-of-type': {
        padding: '8px 8px 0 8px !important',
      },
      '&:last-of-type': {
        padding: '0 8px !important',
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

interface State {
  images: {
    loading: boolean;
    data?: Linode.Image[];
    error?: Error;
  }
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SummaryPanel extends React.Component<CombinedProps, State> {
  state: State = {
    images: {
      loading: false,
    }
  }

  componentDidMount() {
    this.getImages();
  }

  getImages = () => {
    if (this.state.images.loading === false) {
      this.setState({ images: { ...this.state.images, loading: true } });
    }

    return getImages()
      .then(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          data: response.data,
        }
      }))
      .catch(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          error: new Error('Unable to load image data.'),
        }
      }))
  }

  renderImage = () => {
    const { images } = this.state;
    const { linode } = this.props;

    if (images.loading) {
      return <span>Loading image...</span>
    }

    if (images.error) {
      return <span>Unknown Image</span>
    }

    return (!!images.data && !!linode)
      ? <span>{safeGetImageLabel(images.data, linode.image)}</span>
      : <span>Unknown Image</span>
  }

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
            <div className={classes.section}>
              {this.renderImage()}
            </div>
            <div className={classes.section}>
              {<span>
                {typesLongLabel}
              </span>}
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <div className={classes.section}>
              <IPAddress ips={linode.ipv4} copyRight />
            </div>
            {
              linode.ipv6 &&
              <div className={classes.section}>
                <IPAddress ips={[linode.ipv6]} copyRight />
              </div>
            }
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
                  Volumes:&#160;<Link
                    className={classes.volumeLink}
                    to={`/linodes/${linode.id}/volumes`}>{volumes.length}</Link>
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

export default compose(styled)(SummaryPanel) as React.ComponentType<Props>;
