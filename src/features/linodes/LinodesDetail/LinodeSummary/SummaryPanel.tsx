import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import BackupStatus from 'src/components/BackupStatus';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import TagsPanel from 'src/components/TagsPanel';
import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';
import withImage from 'src/containers/withImage.container';
import withMostRecentBackup from 'src/containers/withMostRecentBackup.container';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { formatRegion } from 'src/utilities';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodeNetSummary from './LinodeNetSummary';

import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

type ClassNames = 'region' | 'volumeLink' | 'regionInner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {},
  summarySection: {},
  section: {},
  main: {},
  sidebar: {},
  domainSidebar: {},
  titleWrapper: {},
  region: {
    [theme.breakpoints.between('sm', 'md')]: {
      flexBasis: '100%',
      maxWidth: '100%',
      display: 'flex'
    }
  },
  regionInner: {
    [theme.breakpoints.only('xs')]: {
      padding: `0 ${theme.spacing.unit}px !important`
    },
    [theme.breakpoints.up('lg')]: {
      '&:first-of-type': {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit}px 0 ${
          theme.spacing.unit
        }px !important`
      },
      '&:last-of-type': {
        padding: `0 ${theme.spacing.unit}px !important`
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
      linodeVolumesError,
      linodeTags,
      linodeId,
      linodeRegion,
      linodeIpv4,
      linodeIpv6,
      backupsEnabled,
      mostRecentBackup,
      readOnly
    } = this.props;

    return (
      <div className={classes.root}>
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Linode Details
          </Typography>
          <div className={classes.section}>{this.renderImage()}</div>
          <div
            className={classes.section}
            data-qa-volumes={linodeVolumes.length}
          >
            <Typography>
              Volumes:&#160;
              {linodeVolumesError ? (
                getErrorStringOrDefault(linodeVolumesError)
              ) : (
                <Link
                  className={classes.volumeLink}
                  to={`/linodes/${linodeId}/volumes`}
                >
                  {linodeVolumes.length}
                </Link>
              )}
            </Typography>
          </div>
          <div className={`${classes.section}`}>
            {formatRegion(linodeRegion)}
          </div>
        </Paper>
        <Paper className={classes.summarySection}>
          <LinodeNetSummary linodeId={linodeId} />
        </Paper>
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            IP Addresses
          </Typography>
          <div className={classes.section}>
            <IPAddress ips={linodeIpv4} copyRight showAll />
            {linodeIpv6 && (
              <div className={classes.section}>
                <IPAddress ips={[linodeIpv6]} copyRight showAll />
              </div>
            )}
          </div>
        </Paper>
        <Paper className={classes.summarySection} style={{ paddingBottom: 24 }}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Last Backup
          </Typography>
          <BackupStatus
            linodeId={linodeId}
            backupsEnabled={backupsEnabled}
            mostRecentBackup={mostRecentBackup}
          />
        </Paper>
        <Paper className={classes.summarySection}>
          <Typography variant="h3" className={classes.title} data-qa-title>
            Tags
          </Typography>
          {readOnly ? (
            <Tooltip title="You don't have permission to modify this Linode">
              <div>
                <TagsPanel
                  tags={linodeTags}
                  updateTags={this.updateTags}
                  disabled
                />
              </div>
            </Tooltip>
          ) : (
            <TagsPanel tags={linodeTags} updateTags={this.updateTags} />
          )}
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
  mostRecentBackup: string | null;
  linodeVolumes: Linode.Volume[];
  linodeVolumesError?: Linode.ApiFieldError[];
  backupsEnabled: boolean;
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeIpv4: linode.ipv4,
  linodeIpv6: linode.ipv6,
  linodeRegion: linode.region,
  linodeImageId: linode.image,
  linodeTags: linode.tags,
  linodeId: linode.id,
  backupsEnabled: linode.backups.enabled,
  linodeVolumes: linode._volumes,
  linodeVolumesError: linode._volumesError,
  readOnly: linode._permissions === 'read_only'
}));

const enhanced = compose<CombinedProps, {}>(
  styled,
  localStyles,
  linodeContext,
  withLinodeActions,
  withMostRecentBackup<LinodeContextProps & WithImage, LinodeContextProps>(
    props => props.linodeId,
    (ownProps, mostRecentBackup) => ({ ...ownProps, mostRecentBackup })
  ),
  withImage<LinodeContextProps & WithImage, LinodeContextProps>(
    props => props.linodeImageId,
    (ownProps, image) => ({ ...ownProps, image })
  )
);

export default enhanced(SummaryPanel);
