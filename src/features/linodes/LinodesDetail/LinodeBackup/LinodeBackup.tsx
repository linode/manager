import * as React from 'react';
import * as moment from 'moment';
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
    margin: `${theme.spacing.unit * 2}px 0`,
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

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

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

  Table = ({ backups }: { backups: Linode.LinodeBackup[]}): JSX.Element | null => {
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Disks</TableCell>
              <TableCell>Space Required</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {backups.map((backup) => {
              return (
                <TableRow key={backup.id}>
                  <TableCell>
                    {moment.utc(backup.created).local().format('YYYY-MM-DD - HH:MM')}
                  </TableCell>
                  <TableCell>{typeMap[backup.type]}</TableCell>
                  <TableCell>
                    {moment.duration(
                      moment(backup.finished).diff(moment(backup.created)),
                    ).humanize()}
                  </TableCell>
                  <TableCell>
                    {backup.disks.map(disk => (
                      <div>{disk.label} ({disk.filesystem}) - {disk.size}MB</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {backup.disks.reduce((acc, disk) => (
                      acc + disk.size
                    ), 0)}MB
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  Management = (): JSX.Element | null => {
    const { classes } = this.props;
    const backups = this.aggregateBackups();

    return (
      <React.Fragment>
        <Typography
          variant="title"
          className={classes.title}>
          Backups
        </Typography>
        {backups &&
          <this.Table backups={backups} />
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
