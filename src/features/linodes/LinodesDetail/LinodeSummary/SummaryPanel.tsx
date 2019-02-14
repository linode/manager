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
import TagsPanel from 'src/components/TagsPanel';
import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';
import withImage from 'src/containers/withImage.container';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { formatRegion } from 'src/utilities';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'region' | 'volumeLink' | 'regionInner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {},
  summarySection: {},
  section: {},
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

type CombinedProps = LinodeContextProps &
  LinodeActionsProps &
  WithImage &
  StyleProps &
  WithStyles<ClassNames>;

class SummaryPanel extends React.Component<CombinedProps> {
  renderImage = () => {
    const { image } = this.props;

    return (
      <span>
        {image ? image.label : image === null ? 'No Image' : 'Unknown Image'}
      </span>
    );
  };

  updateTags = async (tags: string[]) => {
    const { linodeId, linodeActions } = this.props;

    /** Send the request (which updates the internal store.) */
    await linodeActions.updateLinode({ linodeId, tags });
  };

  render() {
    const {
      classes,
      linodeVolumes,
      linodeTags,
      linodeId,
      linodeRegion,
      linodeIpv4,
      linodeIpv6
    } = this.props;

    return (
      <div className={classes.root}>
        <Paper className={classes.summarySection}>
          <Typography
            role="header"
            variant="h3"
            className={classes.title}
            data-qa-title
          >
            Linode Details
          </Typography>
          <div className={classes.section}>{this.renderImage()}</div>
          <div
            className={classes.section}
            data-qa-volumes={linodeVolumes.length}
          >
            Volumes:&#160;
            <Link
              className={classes.volumeLink}
              to={`/linodes/${linodeId}/volumes`}
            >
              {linodeVolumes.length}
            </Link>
          </div>
          <div className={`${classes.section}`}>
            {formatRegion(linodeRegion)}
          </div>
        </Paper>

        <Paper className={classes.summarySection}>
          <Typography
            role="header"
            variant="h3"
            className={classes.title}
            data-qa-title
          >
            IP Addresses
          </Typography>
          <div className={classes.section}>
            <IPAddress ips={linodeIpv4} copyRight showMore />
          </div>
          {linodeIpv6 && (
            <div className={classes.section}>
              <IPAddress ips={[linodeIpv6]} copyRight showMore />
            </div>
          )}
        </Paper>
        <Paper className={classes.summarySection}>
          <Typography
            role="header"
            variant="h3"
            className={classes.title}
            data-qa-title
          >
            Tags
          </Typography>
          <TagsPanel tags={linodeTags} updateTags={this.updateTags} />
        </Paper>
      </div>
    );
  }
}

const localStyles = withStyles(styles);

interface WithImage {
  image?: Linode.Image;
}

interface LinodeContextProps {
  linodeId: number;
  linodeImageId: string;
  linodeIpv4: any;
  linodeIpv6: any;
  linodeRegion: string;
  linodeTags: string[];
  linodeVolumes: Linode.Volume[];
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeIpv4: linode.ipv4,
  linodeIpv6: linode.ipv6,
  linodeRegion: linode.region,
  linodeImageId: linode.image,
  linodeTags: linode.tags,
  linodeId: linode.id,
  linodeVolumes: linode._volumes
}));

const enhanced = compose<CombinedProps, {}>(
  styled,
  localStyles,
  linodeContext,
  withLinodeActions,
  withImage<LinodeContextProps & WithImage, LinodeContextProps>(
    props => props.linodeImageId,
    (ownProps, image) => ({ ...ownProps, image })
  )
);

export default enhanced(SummaryPanel);
