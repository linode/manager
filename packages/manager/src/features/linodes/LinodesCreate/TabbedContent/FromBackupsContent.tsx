import {
  getLinodeBackups,
  Linode,
  LinodeBackupsResponse
} from 'linode-js-sdk/lib/linodes';
import { compose as ramdaCompose, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Placeholder from 'src/components/Placeholder';
import { reportException } from 'src/exceptionReporting';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import AddonsPanel from '../AddonsPanel';
import SelectBackupPanel from '../SelectBackupPanel';
import SelectLinodePanel from '../SelectLinodePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import {
  BackupFormStateHandlers,
  Info,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithLinodesTypesRegionsAndImages
} from '../types';
import { extendLinodes, getRegionIDFromLinodeID } from '../utilities';
import { renderBackupsDisplaySection } from './utils';

export interface LinodeWithBackups extends Linode {
  currentBackups: LinodeBackupsResponse;
}

type ClassNames = 'root' | 'main' | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    main: {},
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important'
      }
    }
  });

interface Props {
  disabled?: boolean;
}

interface State {
  linodesWithBackups: LinodeWithBackups[] | null;
  userHasBackups: boolean;
  backups: boolean;
  selectedBackupInfo: Info;
  backupInfo: Info;
  isGettingBackups: boolean;
  selectedLinodeWithBackups?: LinodeWithBackups;
}

export type CombinedProps = Props &
  BackupFormStateHandlers &
  WithLinodesTypesRegionsAndImages &
  ReduxStatePropsAndSSHKeys &
  WithDisplayData &
  WithStyles<ClassNames>;

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  tags: 'Tags for this Linode'
};

const filterLinodesWithBackups = (linodes: Linode[]) =>
  linodes.filter(linode => linode.backups.enabled);

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

  userHasBackups = () => {
    const { linodesData } = this.props;
    return (
      linodesData.filter(thisLinode => thisLinode.backups.enabled).length > 0
    );
  };

  handleSelectBackupInfo = (info: Info) => {
    this.setState({ backupInfo: info });
  };

  getBackupsForLinode = () => {
    const { selectedLinodeID, linodesData } = this.props;

    if (!selectedLinodeID) {
      return;
    }

    this.setState({
      isGettingBackups: true
    });

    getLinodeBackups(selectedLinodeID).then(backups => {
      const selectedLinode = linodesData.find(
        thisLinode => thisLinode.id === selectedLinodeID
      );

      if (!selectedLinode) {
        return this.setState({ isGettingBackups: false });
      }

      const selectedLinodeWithBackups: LinodeWithBackups = {
        ...selectedLinode,
        currentBackups: { ...backups }
      };

      this.setState({ selectedLinodeWithBackups, isGettingBackups: false });
    });
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

    this.props.handleSubmitForm({
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

  // Find regionID from the selectedLinodeID, and update the parent state.
  updateRegion(selectedLinodeID: number) {
    /**
     * this should never happen, but this is coming from a query string
     * so this is just a sanity check
     */
    if (typeof selectedLinodeID !== 'number') {
      reportException(`selectedLinodeID's type is not a number`, {
        selectedLinodeID
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
      this.getBackupsForLinode();
    }
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const { selectedLinodeID } = this.props;
    if (!!selectedLinodeID && prevProps.selectedLinodeID !== selectedLinodeID) {
      this.updateRegion(selectedLinodeID);
      this.getBackupsForLinode();
    }
  }

  render() {
    const {
      backups,
      selectedBackupInfo,
      isGettingBackups,
      selectedLinodeWithBackups
    } = this.state;
    const {
      accountBackupsEnabled,
      classes,
      errors,
      imagesData,
      linodesData,
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
        <Grid
          item
          className={`${classes.main} mlMain py0`}
          id="tabpanel-backup-create"
          role="tabpanel"
          aria-labelledby="tab-backup-create"
        >
          {!this.userHasBackups() ? (
            <Paper>
              <Placeholder
                icon={VolumeIcon}
                copy="You either do not have backups enabled for any Linode
                or your Linodes have not been backed up. Please visit the 'Backups'
                panel in the Linode Settings view"
                title="Create from Backup"
              />
            </Paper>
          ) : (
            <React.Fragment>
              <CreateLinodeDisabled isDisabled={disabled} />
              <SelectLinodePanel
                error={hasErrorFor('linode_id')}
                linodes={ramdaCompose(
                  (linodes: Linode[]) =>
                    extendLinodes(linodes, imagesData, typesData),
                  filterLinodesWithBackups
                )(linodesData)}
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
                  isGettingBackups
                ]}
                loading={isGettingBackups}
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

                if (label) {
                  displaySections.push({
                    title: 'Linode Label',
                    details: label
                  });
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
                    heading="Linode Summary"
                    calculatedPrice={calculatedPrice}
                    isMakingRequest={this.props.formIsSubmitting}
                    disabled={this.props.formIsSubmitting || disabled}
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

export default styled(FromBackupsContent);
