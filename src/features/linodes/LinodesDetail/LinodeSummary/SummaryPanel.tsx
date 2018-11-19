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
  | 'volumeLink';

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
              variant="title"
              className={classes.title}
              data-qa-title
            >
              Summary
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Typography className={classes.section} variant="caption">
              {this.renderImage()}
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
  }
}

const styled = withStyles(styles);

export default compose(styled)(SummaryPanel) as React.ComponentType<Props>;
