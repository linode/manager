import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import { getLinodeBackups, enableBackups } from 'src/services/linode';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import { resetEventsPolling } from 'src/events';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeID: number;
  backupsEnabled: boolean;
  backupsSchedule: Linode.LinodeBackupSchedule;
  backupsMonthlyPrice: number;
}

interface PreloadedProps {
  /* PromiseLoader */
  backups: PromiseLoaderResponse<Linode.LinodeBackup[]>;
}

interface State {}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

class LinodeBackup extends React.Component<CombinedProps, State> {
  enableBackups() {
    const { linodeID } = this.props;
    enableBackups(linodeID);
    resetEventsPolling();
    /**
     * TODO: Show a toast notification while waiting for the event:
     * 'Backups are being enabled'
     **/
  }

  Placeholder = (): JSX.Element | null => {
    const { backupsEnabled, backupsMonthlyPrice } = this.props;

    if (backupsEnabled) {
      return null;
    }

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

  state = {};

  render() {
    return (
      <React.Fragment>
        <this.Placeholder />
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<Props>({
  backups: (props: Props) => getLinodeBackups(props.linodeID)
    .then(response => response.data),
});

const styled = withStyles(styles, { withTheme: true });

export default preloaded(styled(LinodeBackup));
