import * as React from 'react';
import { pathOr } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import { bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import { getLinodes } from 'src/services/linodes';
import { dcDisplayNames } from 'src/constants';
import { generateInFilter } from 'src/events';
import { openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';

import VolumesActionMenu from './VolumesActionMenu';
import VolumeConfigDrawer from './VolumeConfigDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  volumes: Linode.Volume[];
  openForEdit: typeof openForEdit;
  openForResize: typeof openForResize;
}

interface State {
  linodeLabels: { [id: number]: string };
  configDrawer: {
    open: boolean;
    volumePath?: string;
    volumeLabel?: string;
  };
}

type CombinedProps = Props & WithStyles<ClassNames>;

class VolumesLanding extends React.Component<CombinedProps, State> {
  state: State = {
    linodeLabels: {},
    configDrawer: {
      open: false,
    },
  };

  componentDidMount() {
    const linodeIDs = this.props.volumes.map(volume => volume.linode_id).filter(Boolean);
    const xFilter = generateInFilter('id', linodeIDs);
    getLinodes(undefined, xFilter)
      .then((response) => {
        const linodeLabels = {};
        for (const linode of response.data) {
          linodeLabels[linode.id] = linode.label;
        }
        this.setState({ linodeLabels });
      })
      .catch((err) => { /** @todo how do we want to display this error */});
  }

  render() {
    const {
      volumes,
      classes,
      openForEdit,
      openForResize,
    } = this.props;
    const { linodeLabels } = this.state;
    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              Volumes
            </Typography>
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>File System Path</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volumes.map((volume) => {
                const label = pathOr('', ['label'], volume);
                const linodeLabel = linodeLabels[volume.linode_id];
                const size = pathOr('', ['size'], volume);
                const filesystem_path = pathOr(
                  /** @todo Remove path default when API releases filesystem_path. */
                  `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                  ['filesystem_path'],
                  volume,
                );
                const regionID = pathOr('', ['region'], volume);
                const region = dcDisplayNames[regionID];
                return (
                  <TableRow key={volume.id} data-qa-volume-cell>
                    <TableCell data-qa-volume-cell-label>{label}</TableCell>
                    <TableCell data-qa-volume-cell-attachment>{linodeLabel}</TableCell>
                    <TableCell data-qa-volume-size>{size} GB</TableCell>
                    <TableCell data-qa-fs-path>{filesystem_path}</TableCell>
                    <TableCell data-qa-volume-region>{region}</TableCell>
                    <TableCell>
                      <VolumesActionMenu
                        onShowConfig={() => {
                          this.setState({
                            configDrawer: {
                              open: true,
                              volumePath: filesystem_path,
                              volumeLabel: label,
                            },
                          });
                        }}
                        onEdit={() => openForEdit(
                          volume.id,
                          label,
                          size,
                          regionID,
                          linodeLabel,
                        )}
                        onResize={() => openForResize(
                          volume.id,
                          label,
                          size,
                          regionID,
                          linodeLabel,
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
        <VolumeConfigDrawer
          open={this.state.configDrawer.open}
          onClose={() => { this.setState({ configDrawer: { open: false } }); }}
          volumePath={this.state.configDrawer.volumePath}
          volumeLabel={this.state.configDrawer.volumeLabel}
        />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default connected(styled(VolumesLanding));
