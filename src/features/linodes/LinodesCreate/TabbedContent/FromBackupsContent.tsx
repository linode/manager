import * as Promise from 'bluebird';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { compose as ramdaCompose, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import { getLinodeBackups } from 'src/services/linodes';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import AddonsPanel from '../AddonsPanel';
import SelectBackupPanel from '../SelectBackupPanel';
import SelectLinodePanel from '../SelectLinodePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import {
  BackupFormStateHandlers,
  Info,
  WithAll,
  WithDisplayData
} from '../types';
import { extendLinodes } from '../utilities';
import { renderBackupsDisplaySection } from './utils';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  main: {
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        order: 3
      }
    }
  },
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130,
      order: 2
    }
  }
});

interface Props {
  notice?: Notice;
  linodesData: Linode.Linode[];
  selectedBackupFromQuery?: number;
  selectedLinodeFromQuery?: number;
  selectedRegionIDFromLinode?: string;
  disabled?: boolean;
}

interface State {
  linodesWithBackups: Linode.LinodeWithBackups[] | null;
  userHasBackups: boolean;
  backups: boolean;
  selectedBackupInfo: Info;
  backupInfo: Info;
  isGettingBackups: boolean;
}

type CombinedProps = Props &
  LinodeActionsProps &
  InjectedNotistackProps &
  BackupFormStateHandlers &
  WithAll &
  WithDisplayData &
  WithStyles<ClassNames>;

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  tags: 'Tags for this Linode'
};

const filterLinodesWithBackups = (linodes: Linode.LinodeWithBackups[]) => {
  return linodes.filter(linode => {
    const hasAutomaticBackups = !!linode.currentBackups.automatic.length;
    const hasSnapshotBackup = !!linode.currentBackups.snapshot.current;
    // backups both need to be enabled and some backups need to exist
    // for the panel to show the Linode
    return linode.backups.enabled && (hasAutomaticBackups || hasSnapshotBackup);
  });
};

export class FromBackupsContent extends React.Component<CombinedProps, State> {
  state: State = {
    linodesWithBackups: [],
    userHasBackups: false,
    backups: false,
    selectedBackupInfo: undefined,
    backupInfo: undefined,
    isGettingBackups: false
  };

  mounted: boolean = false;

  getLinodesWithBackups = (linodes: Linode.Linode[]) => {
    this.setState({ isGettingBackups: true });
    return Promise.map(
      linodes.filter(l => l.backups.enabled),
      (linode: Linode.Linode) => {
        return getLinodeBackups(linode.id).then(backups => {
          return {
            ...linode,
            currentBackups: {
              ...backups
            }
          };
        });
      }
    )
      .then(data => {
        if (!this.mounted) {
          return;
        }
        this.setState({ linodesWithBackups: data, isGettingBackups: false });
      })
      .catch(err => this.setState({ isGettingBackups: false }));
  };

  userHasBackups = () => {
    const { linodesWithBackups } = this.state;
    return linodesWithBackups!.some((linode: Linode.LinodeWithBackups) => {
      // automatic backups is an array, but snapshots are either null or an object
      // user can have up to 3 automatic backups, but one one snapshot
      return (
        !!linode.currentBackups.automatic.length ||
        !!linode.currentBackups.snapshot.current
      );
    });
  };

  handleSelectBackupInfo = (info: Info) => {
    this.setState({ backupInfo: info });
  };

  createLinode = () => {
    const {
      backupsEnabled,
      privateIPEnabled,
      selectedTypeID,
      selectedRegionID,
      selectedBackupID,
      label,
      tags
    } = this.props;

    const tagsToAdd = tags ? tags.map(item => item.value) : undefined;

    this.props.handleSubmitForm('createFromBackup', {
      region: selectedRegionID,
      type: selectedTypeID,
      private_ip: privateIPEnabled,
      backup_id: Number(selectedBackupID),
      label,
      backups_enabled: backupsEnabled /* optional */,
      booted: true,
      tags: tagsToAdd
    });
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.getLinodesWithBackups(this.props.linodesData);
    // If there is a selected Linode ID (from props), make sure its information
    // is set to state as if it had been selected manually.
  }

  render() {
    const {
      backups,
      linodesWithBackups,
      isGettingBackups,
      selectedBackupInfo
    } = this.state;
    const {
      accountBackupsEnabled,
      classes,
      errors,
      privateIPEnabled,
      selectedBackupID,
      selectedDiskSize,
      selectedLinodeID,
      selectedTypeID,
      setBackupID,
      togglePrivateIPEnabled,
      toggleBackupsEnabled,
      regionDisplayInfo,
      typeDisplayInfo,
      disabled,
      label,
      tags,
      typesData,
      updateLinodeID,
      updateTypeID,
      updateTags,
      backupsMonthlyPrice,
      backupsEnabled,
      updateLabel
    } = this.props;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    const imageInfo = selectedBackupInfo;

    const hasBackups = backups || accountBackupsEnabled;

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain`}>
          {this.state.isGettingBackups ? (
            <CircleProgress noTopMargin />
          ) : !this.userHasBackups() ? (
            <Placeholder
              icon={VolumeIcon}
              copy="You either do not have backups enabled for any Linode
                or your Linodes have not been backed up. Please visit the 'Backups'
                panel in the Linode Settings view"
              title="Create from Backup"
            />
          ) : (
            <React.Fragment>
              <CreateLinodeDisabled isDisabled={disabled} />
              <SelectLinodePanel
                error={hasErrorFor('linode_id')}
                linodes={ramdaCompose(
                  (linodes: Linode.LinodeWithBackups[]) =>
                    extendLinodes(linodes),
                  filterLinodesWithBackups
                )(linodesWithBackups!)}
                selectedLinodeID={selectedLinodeID}
                handleSelection={updateLinodeID}
                updateFor={[selectedLinodeID, errors]}
                disabled={disabled}
                notice={{
                  level: 'warning',
                  text: `This newly created Linode will be created with
                          the same password and SSH Keys (if any) as the original Linode.
                          Also note that this Linode will need to be manually booted after it finishes
                          provisioning.`
                }}
              />
              <SelectBackupPanel
                error={hasErrorFor('backup_id')}
                backups={linodesWithBackups!.filter(
                  (linode: Linode.LinodeWithBackups) => {
                    return linode.id === +selectedLinodeID!;
                  }
                )}
                selectedLinodeID={selectedLinodeID}
                selectedBackupID={selectedBackupID}
                handleChangeBackup={setBackupID}
                handleChangeBackupInfo={this.handleSelectBackupInfo}
                updateFor={[selectedLinodeID, selectedBackupID, errors]}
              />
              <SelectPlanPanel
                error={hasErrorFor('type')}
                types={typesData}
                onSelect={updateTypeID}
                selectedID={selectedTypeID}
                selectedDiskSize={selectedDiskSize}
                updateFor={[selectedTypeID, selectedDiskSize, errors]}
                disabled={disabled}
              />
              <LabelAndTagsPanel
                labelFieldProps={{
                  label: 'Linode Label',
                  value: label || '',
                  onChange: updateLabel,
                  errorText: hasErrorFor('label'),
                  disabled
                }}
                tagsInputProps={{
                  value: tags || [],
                  onChange: updateTags,
                  tagError: hasErrorFor('tags'),
                  disabled
                }}
                updateFor={[tags, label, errors]}
              />
              <AddonsPanel
                backups={backupsEnabled}
                accountBackups={accountBackupsEnabled}
                changeBackups={toggleBackupsEnabled}
                changePrivateIP={togglePrivateIPEnabled}
                backupsMonthly={backupsMonthlyPrice}
                privateIP={privateIPEnabled}
                updateFor={[privateIPEnabled, backupsEnabled, selectedTypeID]}
                disabled={disabled}
              />
            </React.Fragment>
          )}
        </Grid>
        {!this.userHasBackups() ? (
          <React.Fragment />
        ) : (
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <Sticky topOffset={-24} disableCompensation>
              {(props: StickyProps) => {
                const displaySections = [];
                if (imageInfo) {
                  displaySections.push(imageInfo);
                }

                if (regionDisplayInfo) {
                  displaySections.push({
                    title: regionDisplayInfo.title,
                    details: regionDisplayInfo.details
                  });
                }

                if (typeDisplayInfo) {
                  displaySections.push(typeDisplayInfo);
                }

                if (
                  hasBackups &&
                  typeDisplayInfo &&
                  typeDisplayInfo.backupsMonthly
                ) {
                  displaySections.push(
                    renderBackupsDisplaySection(
                      accountBackupsEnabled,
                      typeDisplayInfo.backupsMonthly
                    )
                  );
                }

                let calculatedPrice = pathOr(0, ['monthly'], typeDisplayInfo);
                if (
                  hasBackups &&
                  typeDisplayInfo &&
                  typeDisplayInfo.backupsMonthly
                ) {
                  calculatedPrice += typeDisplayInfo.backupsMonthly;
                }

                return (
                  <CheckoutBar
                    heading={`${label || 'Linode'} Summary`}
                    calculatedPrice={calculatedPrice}
                    isMakingRequest={isGettingBackups}
                    disabled={disabled}
                    onDeploy={this.createLinode}
                    displaySections={displaySections}
                    {...props}
                  />
                );
              }}
            </Sticky>
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withSnackbar,
  withLinodeActions
);

export default enhanced(FromBackupsContent);
