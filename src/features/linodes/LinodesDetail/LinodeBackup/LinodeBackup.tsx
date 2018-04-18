import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Typography from 'material-ui/Typography';

import { getLinodeBackups, enableBackups } from 'src/services/linode';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import { resetEventsPolling } from 'src/events';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    margin: `${theme.spacing.unit * 2} 0`,
  },
});

interface Props {
  linodeID: number;
  backupsEnabled: boolean;
  backupsSchedule: Linode.LinodeBackupSchedule;
  backupsMonthlyPrice: number;
}

interface PreloadedProps {
  /* PromiseLoader */
  backups: PromiseLoaderResponse<Linode.LinodeBackupsResponse>;
}

interface State {}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

class LinodeBackup extends React.Component<CombinedProps, State> {
  state = {};

  enableBackups() {
    const { linodeID } = this.props;
    enableBackups(linodeID);
    resetEventsPolling();
    /**
     * TODO: Show a toast notification while waiting for the event:
     * 'Backups are being enabled'
     **/
  }

  aggregateBackups = (): Linode.LinodeBackup[] => {
    const { backups: { response: backups } } = this.props;
    return [...backups.automatic, backups.snapshot.current].filter(b => Boolean(b));
  }

  Placeholder = (): JSX.Element | null => {
    const { backupsMonthlyPrice } = this.props;

    const enableText = backupsMonthlyPrice
      ? `Enable Backups $${backupsMonthlyPrice.toFixed(2)}/mo`
      : `Enable Backups`;

    return (
      <Placeholder
        icon={VolumeIcon}
        title="Backups"
        copy="Take automatic snapshots of the files on your Linode"
        buttonProps={{
          onClick: () => this.enableBackups(),
          children: enableText,
        }}
      />
    );
  }

  Table = (): JSX.Element | null => {
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>File System Path</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              attachedVolumes!.map((volume) => {
                /** @todo Remove path defaulting when API releases filesystem_path. */
                const label = pathOr('', ['label'], volume);
                const size = pathOr('', ['size'], volume);
                const filesystem_path = pathOr(
                  `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                  ['filesystem_path'],
                  volume,
                );

                return <TableRow key={volume.id}>
                  <TableCell>{label}</TableCell>
                  <TableCell>{size} GiB</TableCell>
                  <TableCell>{filesystem_path}</TableCell>
                  <TableCell>
                    <ActionMenu
                      volumeId={volume.id}
                      onDetach={this.openUpdateDialog('detach', volume.id)}
                      onDelete={this.openUpdateDialog('delete', volume.id)}
                      onClone={this.openUpdatingDrawer(
                        'clone',
                        volume.id,
                        volume.label,
                        volume.size,
                      )}
                      onEdit={this.openUpdatingDrawer(
                        'edit',
                        volume.id,
                        volume.label,
                        volume.size,
                      )}
                      onResize={this.openUpdatingDrawer(
                        'resize',
                        volume.id,
                        volume.label,
                        volume.size,
                      )}
                    />
                  </TableCell>
                </TableRow>;
              })
            }
          </TableBody>
        </Table>
      </Paper>
    );
  }

  Management = (): JSX.Element | null => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography
          variant="title"
          className={classes.title}>
          Backups
        </Typography>
        {this.aggregateBackups() &&
          <this.Table />
        }
      </React.Fragment>
    );
  }

  render() {
    const { backupsEnabled } = this.props;

    return (
      <React.Fragment>
        {backupsEnabled
          ? <this.Management />
          : <this.Placeholder />
        }
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<Props>({
  backups: (props: Props) => getLinodeBackups(props.linodeID),
});

const styled = withStyles(styles, { withTheme: true });

export default preloaded(styled(LinodeBackup));
