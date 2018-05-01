import * as React from 'react';
import { pathOr } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

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

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  volumes: Linode.Volume[];
}

interface State {
  linodeLabels: { [id: number]: string };
}

type CombinedProps = Props & WithStyles<ClassNames>;

class VolumesLanding extends React.Component<CombinedProps, State> {
  state = {
    linodeLabels: {},
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
    const { volumes, classes } = this.props;
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
                const region = dcDisplayNames[pathOr('', ['region'], volume)];
                return (
                  <TableRow key={volume.id} data-qa-volume-cell>
                    <TableCell data-qa-volume-cell-label>{label}</TableCell>
                    <TableCell data-qa-volume-cell-attachment>{linodeLabel}</TableCell>
                    <TableCell data-qa-volume-size>{size} GB</TableCell>
                    <TableCell data-qa-fs-path>{filesystem_path}</TableCell>
                    <TableCell data-qa-volume-region>{region}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(VolumesLanding);
