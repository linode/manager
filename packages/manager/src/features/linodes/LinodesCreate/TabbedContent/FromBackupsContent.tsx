import {
  getLinodeBackups,
  Linode,
  LinodeBackupsResponse,
} from '@linode/api-v4/lib/linodes';
import { compose as ramdaCompose } from 'ramda';
import * as React from 'react';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Placeholder from 'src/components/Placeholder';
import { reportException } from 'src/exceptionReporting';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import SelectBackupPanel from '../SelectBackupPanel';
import SelectLinodePanel from '../SelectLinodePanel';
import {
  BackupFormStateHandlers,
  Info,
  ReduxStateProps,
  WithLinodesTypesRegionsAndImages,
} from '../types';
import { extendLinodes, getRegionIDFromLinodeID } from '../utilities';

export interface LinodeWithBackups extends Linode {
  currentBackups: LinodeBackupsResponse;
}

type ClassNames = 'main';

const styles = (theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%',
      },
    },
  });

interface Props {
  disabled?: boolean;
}

interface State {
  backupInfo: Info;
  isGettingBackups: boolean;
  selectedLinodeWithBackups?: LinodeWithBackups;
  backupsError?: string;
}

export type CombinedProps = Props &
  BackupFormStateHandlers &
  ReduxStateProps &
  WithLinodesTypesRegionsAndImages &
  WithStyles<ClassNames>;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  tags: 'Tags for this Linode',
  backup_id: 'Backup ID',
};

const filterLinodesWithBackups = (linodes: Linode[]) =>
  linodes.filter((linode) => linode.backups.enabled);

export class FromBackupsContent extends React.Component<CombinedProps, State> {
  state: State = {
    backupInfo: undefined,
    isGettingBackups: false,
  };

  mounted: boolean = false;

  handleSelectBackupInfo = (info: Info) => {
    this.setState({ backupInfo: info });
  };

  getBackupsForLinode = (linodeId: number) => {
    const { linodesData } = this.props;

    if (!linodeId) {
      return;
    }

    this.setState({
      isGettingBackups: true,
      backupsError: undefined,
    });

    getLinodeBackups(linodeId)
      .then((backups) => {
        const selectedLinode = linodesData.find(
          (thisLinode) => thisLinode.id === linodeId
        );

        if (!selectedLinode) {
          return this.setState({ isGettingBackups: false });
        }

        const selectedLinodeWithBackups: LinodeWithBackups = {
          ...selectedLinode,
          currentBackups: { ...backups },
        };

        this.setState({ selectedLinodeWithBackups, isGettingBackups: false });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err) => {
        this.setState({
          isGettingBackups: false,
          backupsError: 'Error retrieving backups for this Linode.',
        });
      });
  };

  // Find regionID from the selectedLinodeID, and update the parent state.
  updateRegion(selectedLinodeID: number) {
    /**
     * This should never happen, but this is coming from a query string
     * so this is just a sanity check
     */
    if (typeof selectedLinodeID !== 'number') {
      reportException(`selectedLinodeID's type is not a number`, {
        selectedLinodeID,
      });
      throw new Error('selectedLinodeID is not a number');
    }
    const regionID = getRegionIDFromLinodeID(
      this.props.linodesData,
      selectedLinodeID
    );
    this.props.updateRegionID(regionID || '');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    // If there is a selected Linode ID (from props), make sure its information
    // is set to state as if it had been selected manually.
    if (this.props.selectedLinodeID) {
      this.updateRegion(this.props.selectedLinodeID);
      this.getBackupsForLinode(this.props.selectedLinodeID);
    }
  }

  handleLinodeSelect = (linodeId: number, diskSize?: number) => {
    this.props.updateLinodeID(linodeId, diskSize);
    this.updateRegion(linodeId);
    this.getBackupsForLinode(linodeId);
  };

  render() {
    const { isGettingBackups, selectedLinodeWithBackups } = this.state;
    const {
      classes,
      disabled,
      errors,
      imagesData,
      linodesData,
      selectedBackupID,
      selectedLinodeID,
      setBackupID,
      typesData,
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    const userHasBackups = linodesData.some(
      (thisLinode) => thisLinode.backups.enabled
    );

    return (
      <Grid item className={`${classes.main} py0`}>
        {!userHasBackups ? (
          <Paper>
            <Placeholder
              isEntity
              icon={VolumeIcon}
              title="Create from Backup"
              renderAsSecondary
            >
              You do not have backups enabled for your Linodes. Please visit the
              Backups panel in the Linode Details view.
            </Placeholder>
          </Paper>
        ) : (
          <React.Fragment>
            <SelectLinodePanel
              error={hasErrorFor('linode_id')}
              linodes={ramdaCompose(
                (linodes: Linode[]) =>
                  extendLinodes(linodes, imagesData, typesData),
                filterLinodesWithBackups
              )(linodesData)}
              selectedLinodeID={selectedLinodeID}
              handleSelection={this.handleLinodeSelect}
              updateFor={[selectedLinodeID, errors]}
              disabled={disabled}
              notice={{
                level: 'warning',
                text: `This newly created Linode will be created with
                          the same password and SSH Keys (if any) as the original Linode.
                          Also note that this Linode will need to be manually booted after it finishes
                          provisioning.`,
              }}
            />
            <SelectBackupPanel
              error={hasErrorFor('backup_id') || this.state.backupsError}
              selectedLinodeWithBackups={selectedLinodeWithBackups}
              selectedLinodeID={selectedLinodeID}
              selectedBackupID={selectedBackupID}
              handleChangeBackup={setBackupID}
              handleChangeBackupInfo={this.handleSelectBackupInfo}
              updateFor={[
                selectedLinodeID,
                selectedBackupID,
                errors,
                selectedLinodeWithBackups,
                isGettingBackups,
              ]}
              loading={isGettingBackups}
            />
          </React.Fragment>
        )}
      </Grid>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromBackupsContent);
