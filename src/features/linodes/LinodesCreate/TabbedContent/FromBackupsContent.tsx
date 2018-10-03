import * as Promise from 'bluebird';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import { resetEventsPolling } from 'src/events';
import { Info } from 'src/features/linodes/LinodesCreate/LinodesCreate';
import { allocatePrivateIP, createLinode, getLinodeBackups } from 'src/services/linodes';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import AddonsPanel from '../AddonsPanel';
import SelectBackupPanel from '../SelectBackupPanel';
import SelectLinodePanel, { ExtendedLinode } from '../SelectLinodePanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import tagsHoc, { TagObject } from '../tagsHoc';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  main: {},
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130,
    },
  },
});

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

interface Props {
  notice?: Notice;
  linodes: Linode.Linode[];
  types: ExtendedType[];
  extendLinodes: (linodes: Linode.Linode[]) => ExtendedLinode[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionInfo: (selectedRegionID: string | null) => Info;
  history: any;
  selectedBackupFromQuery?: number;
  selectedLinodeFromQuery?: number;

  /* From HOC */
  tagObject: TagObject;
}

interface State {
  linodesWithBackups: Linode.LinodeWithBackups[] | null;
  isGettingBackups: boolean;
  userHasBackups: boolean;
  selectedLinodeID: number | undefined;
  selectedBackupID: number | undefined;
  selectedDiskSize: number | undefined;
  selectedTypeID: string | null;
  selectedRegionID: string | null;
  label: string;
  errors?: Linode.ApiFieldError[];
  backups: boolean;
  privateIP: boolean;
  selectedBackupInfo: Info;
  isMakingRequest: boolean;
  backupInfo: Info;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

const filterLinodesWithBackups = (linodes: Linode.LinodeWithBackups[]) => {
  return linodes.filter((linode) => {
    const hasAutomaticBackups = !!linode.currentBackups.automatic.length;
    const hasSnapshotBackup = !!linode.currentBackups.snapshot.current;
    // backups both need to be enabled and some backups need to exist
    // for the panel to show the Linode
    return linode.backups.enabled && (hasAutomaticBackups || hasSnapshotBackup);
  })
};

export class FromBackupsContent extends React.Component<CombinedProps, State> {
  state: State = {
    linodesWithBackups: [],
    isGettingBackups: false,
    userHasBackups: false,
    selectedLinodeID: this.props.selectedLinodeFromQuery || undefined,
    selectedBackupID: this.props.selectedBackupFromQuery || undefined,
    selectedDiskSize: undefined,
    selectedTypeID: null,
    selectedRegionID: null,
    label: '',
    backups: false,
    privateIP: false,
    selectedBackupInfo: undefined,
    isMakingRequest: false,
    backupInfo: undefined,
  };

  mounted: boolean = false;

  getLinodesWithBackups = (linodes: Linode.Linode[]) => {
    this.setState({ isGettingBackups: true });
    return Promise.map(linodes.filter(l => l.backups.enabled), (linode: Linode.Linode) => {
      return getLinodeBackups(linode.id)
        .then((backups) => {
          return {
            ...linode,
            currentBackups: {
              ...backups,
            },
          };
        });
    }).then((data) => {
      if (!this.mounted) { return; }
      this.setState({ linodesWithBackups: data, isGettingBackups: false });
    })
      .catch(err => this.setState({ isGettingBackups: false }));
  }

  userHasBackups = () => {
    const { linodesWithBackups } = this.state;
    return linodesWithBackups!.some((linode: Linode.LinodeWithBackups) => {
      // automatic backups is an array, but snapshots are either null or an object
      // user can have up to 3 automatic backups, but one one snapshot
      return !!linode.currentBackups.automatic.length || !!linode.currentBackups.snapshot.current;
    });
  }

  handleSelectLinode = (linode: Linode.Linode) => {
    this.setState({
      selectedLinodeID: linode.id,
      selectedTypeID: null,
      selectedRegionID: linode.region,
      selectedDiskSize: linode.specs.disk,
      selectedBackupID: undefined,
    });
  }

  handleSelectBackupID = (id: number) => {
    this.setState({ selectedBackupID: id });
  }

  handleSelectBackupInfo = (info: Info) => {
    this.setState({ backupInfo: info });
  }

  handleSelectPlan = (id: string) => {
    this.setState({ selectedTypeID: id });
  }

  handleSelectLabel = (e: any) => {
    this.setState({ label: e.target.value });
  }

  handleToggleBackups = () => {
    this.setState({ backups: !this.state.backups });
  }

  handleTogglePrivateIP = () => {
    this.setState({ privateIP: !this.state.privateIP });
  }

  deployLinode = () => {
    if (!this.state.selectedBackupID) {
      /* a backup selection is also required */
      this.setState({
        errors: [
          { field: 'backup_id', reason: 'You must select a Backup' },
        ],
      }, () => {
        scrollErrorIntoView();
      });
      return;
    }
    this.createLinode();
  }

  createLinode = () => {
    const { history, tagObject } = this.props;
    const { getLinodeTagList } = tagObject.actions;
    const {
      selectedRegionID,
      selectedTypeID,
      label,
      backups,
      privateIP,
      selectedBackupID,
    } = this.state;

    this.setState({ isMakingRequest: true });

    createLinode({
      region: selectedRegionID,
      type: selectedTypeID,
      backup_id: Number(selectedBackupID),
      label, /* optional */
      backups_enabled: backups, /* optional */
      booted: true,
      tags: getLinodeTagList(),
    })
      .then((linode) => {
        if (privateIP) { allocatePrivateIP(linode.id) };
        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.setState(() => ({
          errors: error.response && error.response.data && error.response.data.errors,
        }));
      })
      .finally(() => {
        if (!this.mounted) { return; }
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.getLinodesWithBackups(this.props.linodes);
  }

  render() {
    const { errors, selectedBackupID, selectedDiskSize, selectedLinodeID,
      selectedTypeID, selectedRegionID, label, backups, linodesWithBackups, privateIP,
    selectedBackupInfo, isMakingRequest } = this.state;
    const { extendLinodes, getBackupsMonthlyPrice, classes,
       notice, types, getRegionInfo, getTypeInfo, tagObject } = this.props;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const imageInfo = selectedBackupInfo;

    const regionInfo = getRegionInfo(selectedRegionID);

    const typeInfo = getTypeInfo(selectedTypeID);

    return (
      <React.Fragment>
      <Grid item className={`${classes.main} mlMain`}>
        {(this.state.isGettingBackups)
          ? <CircleProgress noTopMargin />
          : (!this.userHasBackups())
            ? <Placeholder
            icon={VolumeIcon}
                copy="You either do not have backups enabled for any Linode
                or your Linodes have not been backed up. Please visit the 'Backups'
                panel in the Linode Settings view"
                title="Create from Backup"
                />
                : <React.Fragment>
        {notice &&
          <Notice
            text={notice.text}
            error={(notice.level) === 'error'}
            warning={(notice.level === 'warning')}
          />
        }
        {generalError &&
          <Notice text={generalError} error={true} />
        }
        <SelectLinodePanel
          error={hasErrorFor('linode_id')}
          linodes={compose(
            (linodes: Linode.LinodeWithBackups[]) => extendLinodes(linodes),
            filterLinodesWithBackups,
          )(linodesWithBackups!)}
          selectedLinodeID={selectedLinodeID}
          handleSelection={this.handleSelectLinode}
          updateFor={[selectedLinodeID, errors]}
        />
        <SelectBackupPanel
          error={hasErrorFor('backup_id')}
          backups={linodesWithBackups!
            .filter((linode: Linode.LinodeWithBackups) => {
              return linode.id === +selectedLinodeID!;
            })}
          selectedLinodeID={selectedLinodeID}
          selectedBackupID={selectedBackupID}
          handleChangeBackup={this.handleSelectBackupID}
          handleChangeBackupInfo={this.handleSelectBackupInfo}
          updateFor={[selectedLinodeID, selectedBackupID, errors]}
        />
        <SelectPlanPanel
          error={hasErrorFor('type')}
          types={types}
          onSelect={this.handleSelectPlan}
          selectedID={selectedTypeID}
          selectedDiskSize={selectedDiskSize}
          updateFor={[selectedTypeID, selectedDiskSize, errors]}
        />
        <LabelAndTagsPanel
          tagObject={tagObject}
          tagError={hasErrorFor('tag')}
          labelFieldProps={{
            label: 'Linode Label',
            value: label || '',
            onChange: this.handleSelectLabel,
            errorText: hasErrorFor('label'),
          }}
          updateFor={[label, tagObject, errors]}
        />
        <AddonsPanel
          backups={backups}
          changeBackups={this.handleToggleBackups}
          changePrivateIP={this.handleTogglePrivateIP}
          backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
          privateIP={privateIP}
          updateFor={[privateIP, backups, selectedTypeID]}
        />
        </React.Fragment>
          }
      </Grid>
        {!this.userHasBackups()
          ? <React.Fragment />
          : <Grid item className={`${classes.sidebar} mlSidebar`}>
            <Sticky
              topOffset={-24}
              disableCompensation>
              {
                (props: StickyProps) => {
                  const displaySections = [];
                  if (imageInfo) {
                    displaySections.push(imageInfo);
                  }

                  if (regionInfo) {
                    displaySections.push({
                      title: regionInfo.title,
                      details: regionInfo.details,
                    });
                  }

                  if (typeInfo) {
                    displaySections.push(typeInfo);
                  }

                  if (backups && typeInfo && typeInfo.backupsMonthly) {
                    displaySections.push({
                      title: 'Backups Enabled',
                      ...(typeInfo.backupsMonthly &&
                        { details: `$${typeInfo.backupsMonthly.toFixed(2)} / monthly` }),
                    });
                  }

                  let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
                  if (backups && typeInfo && typeInfo.backupsMonthly) {
                    calculatedPrice += typeInfo.backupsMonthly;
                  }

                  return (
                    <CheckoutBar
                      heading={`${label || 'Linode'} Summary`}
                      calculatedPrice={calculatedPrice}
                      disabled={isMakingRequest}
                      onDeploy={this.deployLinode}
                      displaySections={displaySections}
                      {...props}
                    />
                  );
                }
              }
            </Sticky>
          </Grid>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  tagsHoc)
  (FromBackupsContent);
